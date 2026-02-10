import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { chatQueue } from './rate-limiter';
import { fetchRepoFileTree } from './github-utils';

// Initialize Clients
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy_key',
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// ---------------------------------------------------------------------------
// Helper: Calculate File Relevance Score
// ---------------------------------------------------------------------------
function calculateScore(filePath: string, userMessage: string): number {
    const lowerPath = filePath.toLowerCase();
    const lowerMsg = userMessage.trim();

    // Split message into significant tokens
    // We treat "syllabus", "notes" as low-weight generic words if they appear alone
    const msgTokens = lowerMsg.split(/[^a-z0-9]+/).filter(t => t.length > 1);

    let score = 0;

    // 1. Exact phrase match (High Priority)
    if (lowerPath.includes(lowerMsg)) {
        score += 80;
    }

    // 2. Token Matching
    for (const token of msgTokens) {
        // Is it a number? (e.g., "6th", "5", "2024") - SUPER HIGH PRIORITY
        // Users often search by semester number.
        const isNumber = /\d/.test(token);
        const weight = isNumber ? 50 : 10;

        // Check for whole word match boundaries for better accuracy
        // e.g., match "6th" but not "26th" if possible, strict check is hard with simple includes
        if (lowerPath.includes(token)) {
            score += weight;

            // Bonus: Token matches start of filename?
            const filename = lowerPath.split('/').pop() || "";
            if (filename.startsWith(token)) {
                score += 15;
            }
        }
    }

    // 3. Sequential Token Bonus
    for (let i = 0; i < msgTokens.length - 1; i++) {
        const bigram = `${msgTokens[i]} ${msgTokens[i + 1]}`;
        if (lowerPath.includes(bigram)) {
            score += 30; // Boost sequential matches "6th sem"
        }
    }

    // 4. Filename specific phrase match
    const filename = lowerPath.split('/').pop() || "";
    if (filename.includes(lowerMsg)) {
        score += 40;
    }

    return score;
}

// Optimized System Prompt
const SYSTEM_PROMPT = `
You are Aditya Pandey, a B.Tech CSE student & Full Stack Developer.
Goal: Chat with portfolio visitors as Aditya.

# Persona:
- Professional but conversational (WhatsApp style).
- Tech Stack: React, Next.js, Node.js, AI/ML.
- Student at Graphic Era Hill University.

# Rules:
1. **Search & Answer**: Use the provided "Resume Context" to answer.
2. **Ambiguity**: If a user asks a vague question (e.g., "syllabus"), ASK for clarification (e.g., "Which semester or subject are you looking for?").
3. **Not Found**: If a specific file/project isn't found, apologize sincerely and suggest an alternative or ask for more details. NEVER invent files.
4. **Projects**: Use provided Repo URLs.
5. **Length**: Keep responses UNDER 50 WORDS unless asked for detail.
6. **No Meta**: Don't say "I am an AI".

# Resume Context:
{CONTEXT}
`;

export async function generateChatResponse(message: string, sessionId: string) {
    try {
        // 1. Fetch Comprehensive Resume Context
        const [about, projects, skills, experience, codingProfileData, certifications] = await Promise.all([
            prisma.about.findFirst({ include: { values: true, focusAreas: true, journey: { include: { paragraphs: true } } } }),
            prisma.project.findMany({ select: { title: true, description: true, repoUrl: true, technologies: true } }),
            prisma.skill.findMany({ where: { isActive: true }, select: { name: true, category: true } }),
            prisma.experience.findMany({ select: { position: true, company: true, duration: true, description: true } }),
            prisma.codingProfile.findUnique({ where: { platform: 'leetcode' } }),
            prisma.certification.findMany({ select: { title: true, organization: true } }),
        ]);

        const codingProfile = codingProfileData as any;
        const lowerMsg = message.toLowerCase().substring(0, 500);

        // 2. Intelligent Project Matching
        // Sort projects: matched ones first, then featured/recent ones
        const matchedProjects = projects.filter(p =>
            p.title && lowerMsg.includes(p.title.toLowerCase())
        );

        // Filter out placeholder descriptions
        const cleanProjects = projects.map(p => ({
            ...p,
            description: (p.description && p.description.includes("didn't type anything")) ? "" : p.description
        }));

        // --- DEEP SEARCH: RESTORED DETERMINISTIC LOGIC (MULTI-CANDIDATE) ---
        const msgTokens = lowerMsg.split(/[^a-z0-9]+/).filter(t => t.length > 1);

        // 1. Find ALL potential candidates (match title tokens)
        const candidates = projects.filter((p: any) => {
            if (!p.title || !p.repoUrl) return false;
            const titleLower = p.title.toLowerCase();
            return lowerMsg.includes(titleLower) || titleLower.split(/[^a-z0-9]+/).some((t: string) => msgTokens.includes(t));
        });

        // 2. Scan top 3 candidates in parallel
        if (candidates.length > 0) {
            const topCandidates = candidates.slice(0, 3);
            console.log(`[ChatAgent] Scanning Top 3: ${topCandidates.map(c => c.title).join(", ")}`);

            const searchResults = await Promise.all(topCandidates.map(async (p) => {
                try {
                    const files = await fetchRepoFileTree(p.repoUrl!);

                    // Filter and Score Matches
                    const scoredMatches = files.map(path => ({
                        path,
                        score: calculateScore(path, lowerMsg)
                    }))
                        .filter(m => m.score > 0);

                    // Dynamic Thresholding:
                    // If user asks "6th sem syllabus" (3 tokens), we expect a decent score.
                    // If file only matches "syllabus" (10 pts), it should be filtered out.
                    // Threshold = (TokenCount * 8) + 10? 
                    // "devops syllabus" (2 tokens) -> 26. "syllabus" match (10) -> Fail. "devops syllabus" match (20+30=50) -> Pass.
                    // "6th sem" (2 tokens, one number) -> 26. "6th" (50) -> Pass.
                    const threshold = (msgTokens.length * 15) - 5;

                    const validMatches = scoredMatches.filter(m => m.score >= threshold);

                    console.log(`[ChatAgent] Matches for ${p.title}: Found ${scoredMatches.length}, Valid > Threshold(${threshold}): ${validMatches.length}`);

                    if (validMatches.length > 0) {
                        return {
                            project: p,
                            files: validMatches.sort((a, b) => b.score - a.score).map(m => m.path)
                        };
                    }
                } catch (e) {
                    console.error(`[ChatAgent] Failed to scan ${p.title}:`, e);
                }
                return null;
            }));

            const validResults = searchResults.filter(r => r !== null);
            console.log(`[ChatAgent] Valid Results: ${validResults.length}`);

            if (validResults.length > 0) {
                // DIRECT RETURN
                const output = validResults.map(r => {
                    // Return up to 50 files so frontend can handle "Read More"
                    const displayFiles = r!.files.slice(0, 50).map(f => {
                        const encodedPath = f.split('/').map(part => encodeURIComponent(part)).join('/');
                        return `- [${f.split('/').pop()}](${r!.project.repoUrl}/blob/main/${encodedPath})`;
                    }).join('\n');
                    const more = r!.files.length > 50 ? `\n...and ${r!.files.length - 50} more.` : '';
                    return `**${r!.project.title}** (${r!.files.length} matches):\n${displayFiles}${more}`;
                }).join('\n\n');

                return `I found relevant files in your projects! 📂\n\n${output}\n\nCheck them out on GitHub! 🚀`;
            }
        } else {
            console.log("[ChatAgent] No candidates found for Deep Search.");
        }

        // Build Optimized Context (Deep Search didn't return directly, so we use LLM)
        const context = JSON.stringify({
            about: about ? {
                heading: about.heading,
                subHeading: about.subHeading,
                values: about.values.map(v => v.value),
                focusAreas: about.focusAreas.map(f => f.title)
            } : "N/A",
            projects: cleanProjects
                .sort((a, b) => {
                    const aMatch = lowerMsg.includes(a.title.toLowerCase()) ? 1 : 0;
                    const bMatch = lowerMsg.includes(b.title.toLowerCase()) ? 1 : 0;
                    return bMatch - aMatch;
                })
                .slice(0, 15) // Increased limit to 15 for better coverage
                .map(p => ({
                    t: p.title,
                    d: p.description?.substring(0, 150),
                    u: p.repoUrl,
                    s: p.technologies?.join(",")
                })),
            skills: skills.map(s => s.name).join(", "),
            experience: experience.map(e => `${e.position} @ ${e.company} (${e.duration})`),
            certifications: certifications.map(c => c.title),
            leetcode: codingProfile ? {
                solved: codingProfile.solvedCount,
                easy: codingProfile.easySolved,
                medium: codingProfile.mediumSolved,
                hard: codingProfile.hardSolved
            } : "N/A"
        });

        const prompt = SYSTEM_PROMPT.replace('{CONTEXT}', context);

        // 3. Execution (Stateless - No History for Max Cost/Token Saving)
        return await chatQueue.add(async () => {
            // Try Groq First
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: prompt },
                        { role: 'user', content: lowerMsg },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 200, // Hard Cap
                });

                return completion.choices[0]?.message?.content || "Hey, I'm online! How can I help?";
            } catch (groqError: any) {
                console.warn("Groq failed:", groqError.message);

                // ONE Fallback attempt to Gemini (No Loop)
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
                    const result = await model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: prompt + `\n\nUser: ${lowerMsg}` }] }],
                        generationConfig: { maxOutputTokens: 200 }
                    });
                    return result.response.text();
                } catch (geminiError: any) {
                    // Fail gracefully immediately
                    return "So tired today, let's chat tomorrow! 😴";
                }
            }
        });

    } catch (error) {
        console.error("Chat Agent Error:", error);
        return "I'm currently offline. Please email me!";
    }
}
