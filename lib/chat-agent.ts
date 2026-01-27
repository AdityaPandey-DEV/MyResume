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

// Optimized System Prompt
const SYSTEM_PROMPT = `
You are Aditya Pandey, a B.Tech CSE student & Full Stack Developer.
Goal: Chat with portfolio visitors as Aditya.

# Persona:
- Professional but conversational (WhatsApp style).
- Tech Stack: React, Next.js, Node.js, AI/ML.
- Student at Parul University.

# Rules:
- Answer ONLY using the Resume Context.
- Projects: Use provided Repo URLs. Check Project List for name matches (e.g. "PYQ" -> "PYQ-GEHU").
- LeetCode: explain concepts, but only claim solved if stats match.
- Keep responses UNDER 50 WORDS unless asked for detail.
- NO: "I am an AI", raw JSON, or Markdown code blocks unless code is asked.

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
        const msgTokens = lowerMsg.split(/[^a-z0-9]+/).filter(t => t.length > 2);

        // 1. Find ALL potential candidates (match title tokens)
        const candidates = projects.filter((p: any) => {
            if (!p.title || !p.repoUrl) return false;
            const titleLower = p.title.toLowerCase();
            return lowerMsg.includes(titleLower) || titleLower.split(/[^a-z0-9]+/).some((t: string) => msgTokens.includes(t));
        });

        // 2. Scan top 3 candidates in parallel
        if (candidates.length > 0) {
            // Prioritize: matched tokens count or exact match? For now, just take first 3 from the filter.
            const topCandidates = candidates.slice(0, 3);
            console.log(`[ChatAgent] Scanning Top 3: ${topCandidates.map(c => c.title).join(", ")}`);

            const searchResults = await Promise.all(topCandidates.map(async (p) => {
                try {
                    console.log(`[ChatAgent] Fetching tree for ${p.title} (${p.repoUrl})...`);
                    const files = await fetchRepoFileTree(p.repoUrl!);
                    console.log(`[ChatAgent] Fetched ${files.length} files for ${p.title}`);
                    const matches = files.filter(path =>
                        msgTokens.some(token => path.toLowerCase().includes(token))
                    );
                    console.log(`[ChatAgent] Matches for ${p.title}: ${matches.length}`);
                    if (matches.length > 0) {
                        return { project: p, files: matches };
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
                    const displayFiles = r!.files.slice(0, 8).map(f => {
                        const encodedPath = f.split('/').map(part => encodeURIComponent(part)).join('/');
                        return `- [${f.split('/').pop()}](${r!.project.repoUrl}/blob/main/${encodedPath})`;
                    }).join('\n');
                    const more = r!.files.length > 8 ? `\n...and ${r!.files.length - 8} more.` : '';
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
