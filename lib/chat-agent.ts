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

// --- AI Intent Analysis ---
type IntentResult =
    | { type: 'SEARCH'; query: string }
    | { type: 'CLARIFY'; question: string }
    | { type: 'CHAT'; response: string };

async function analyzeUserIntent(message: string, previousMessage?: string): Promise<IntentResult> {
    try {
        const historyContext = previousMessage ? `Previous User Message: "${previousMessage}"` : "No previous context.";

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are the Brain of Aditya's Portfolio AI. Classify user message: "${message}".
${historyContext}

Categories:
1. **SEARCH**: User wants specific files/info.
   - **Smart Merging**:
     - If current message is a **refinement** of previous (e.g., Prev: "DevOps", Curr: "6th sem") -> MERGE: "DevOps 6th sem"
     - If current message is a **new topic** (e.g., Prev: "Electronics", Curr: "6th sem syllabus") -> NEW: "6th semester syllabus" (Ignore previous)
     - If current message is a **correction** (e.g., Prev: "6th sem", Curr: "no, 5th sem") -> NEW: "5th semester"
   - **Fix Typos**: "electroicss" -> "electronics"
   - **Expand Acronyms**: "DS" -> "Data Structures"
   - Output: SEARCH: <cleaned_specific_keywords>

2. **CLARIFY**: Query is too vague (e.g., "syllabus", "notes") with NO subject/semester AND NO previous context.
   - Output: CLARIFY: <short_question>

3. **CHAT**: Greetings, identity, or casual.
   - Output: CHAT: <friendly_response>

Output ONLY the formatted string.`
                },
                { role: 'user', content: message }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3,
            max_tokens: 50,
        });

        const output = completion.choices[0]?.message?.content?.trim() || "CHAT: I'm here to help!";

        if (output.startsWith("SEARCH:")) return { type: 'SEARCH', query: output.replace("SEARCH:", "").trim() };
        if (output.startsWith("CLARIFY:")) return { type: 'CLARIFY', question: output.replace("CLARIFY:", "").trim() };
        if (output.startsWith("CHAT:")) return { type: 'CHAT', response: output.replace("CHAT:", "").trim() };

        return { type: 'CHAT', response: output };
    } catch (e) {
        console.error("Intent Analysis Failed:", e);
        // Fallback: If context exists and message is short, simple merge. Else raw.
        if (previousMessage && message.split(' ').length < 8) {
            return { type: 'SEARCH', query: `${previousMessage} ${message}` };
        }
        return { type: 'SEARCH', query: message };
    }
}

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

    // 2. Token Matching with Positional Priority
    // Earlier tokens get higher weight (Left-to-Right Priority)
    msgTokens.forEach((token, index) => {
        // Is it a number? (e.g., "6th", "5", "2024") - SUPER HIGH PRIORITY
        // Users often search by semester number.
        const isNumber = /\d/.test(token);

        // Base weight: 
        // - Numbers: 60 (Increased slightly)
        // - Words: 15
        // Positional Boost: (TotalTokens - Index) * 15 
        // e.g. "6th sem syllabus" (3 tokens):
        // "6th" (index 0): 60 + (3-0)*15 = 105
        // "sem" (index 1): 15 + (3-1)*15 = 45
        // "syllabus" (index 2): 15 + (3-2)*15 = 30
        const positionBonus = (msgTokens.length - index) * 15;
        const weight = (isNumber ? 60 : 15) + positionBonus;

        // Check for whole word match boundaries for better accuracy
        if (lowerPath.includes(token)) {
            score += weight;

            // Bonus: Token matches start of filename?
            const filename = lowerPath.split('/').pop() || "";
            if (filename.startsWith(token)) {
                score += 20;
            }
        }
    });

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
3. **Not Found / Partial Match**: 
   - If a specific subject (e.g., "DevOps") is requested but NOT found in the context, DO NOT hallucinate. 
   - Instead, ask clarifying questions in this specific order to widen the scope:
     a. "Which semester is this subject in?"
     b. "Is this for a specific course or specialization?"
     c. "Is this for a specific university?"
   - Say something like: "I couldn't find 'DevOps' in my immediate project files. Which semester is this for? I can check if it's under a different name."
4. **Projects**: Use provided Repo URLs.
5. **Length**: Keep responses UNDER 50 WORDS unless asked for detail.
6. **No Meta**: Don't say "I am an AI".

# Resume Context:
{CONTEXT}
`;

export async function generateChatResponse(message: string, sessionId: string) {
    try {
        // 1. Context Awareness: Fetch Previous User Message
        let contextMessage = message;
        let prevMsg = "";

        try {
            // Fetch last 2 user messages to avoid getting the current one if it was just saved
            const lastMessages = await prisma.chatMessage.findMany({
                where: { sessionId, role: 'user' },
                orderBy: { createdAt: 'desc' },
                take: 2
            });

            // If the latest message in DB is the same as current (likely), skip it.
            // If the latest message is NOT the current one (e.g. streaming/delayed save), use it.
            if (lastMessages.length > 0) {
                if (lastMessages[0].content.trim() === message.trim() && lastMessages.length > 1) {
                    prevMsg = lastMessages[1].content;
                } else if (lastMessages[0].content.trim() !== message.trim()) {
                    prevMsg = lastMessages[0].content;
                }
            }

            // Heuristic: If current message is short (< 8 words), it might be a refinement (e.g. "6th sem")
            // REMOVED: Old heuristic was causing sticky context. 
            // Now we rely on analyzeUserIntent to decide if we should merge or not.
        } catch (e) {
            console.warn("[ChatAgent] Failed to fetch history:", e);
        }

        // --- 2. AI INTENT ANALYSIS ---
        // Pass contextMessage (which is just 'message' now, unless we want to do manual pre-processing)
        // Actually, we should pass 'message' and 'prevMsg' to the LLM.
        const intent = await analyzeUserIntent(message, prevMsg || undefined);

        if (intent.type === 'CLARIFY') {
            return intent.question;
        }

        if (intent.type === 'CHAT') {
            // Check if it's a "hello" type message or something that really needs context?
            // "CHAT" implies simple conversational response.
            // However, we want to be safe. If the User asks "Who are you?", CHAT handles it.
            return intent.response;
        }

        // --- SEARCH INTENT ---
        // Use the REFINED query for searching
        const lowerMsg = intent.query.toLowerCase().substring(0, 500);
        console.log(`[ChatAgent] Refined Search Query: "${lowerMsg}" (Original: "${contextMessage}")`);

        // 3. Fetch Comprehensive Resume Context
        const [about, projects, skills, experience, codingProfileData, certifications] = await Promise.all([
            prisma.about.findFirst({ include: { values: true, focusAreas: true, journey: { include: { paragraphs: true } } } }),
            prisma.project.findMany({ select: { title: true, description: true, repoUrl: true, technologies: true } }),
            prisma.skill.findMany({ where: { isActive: true }, select: { name: true, category: true } }),
            prisma.experience.findMany({ select: { position: true, company: true, duration: true, description: true } }),
            prisma.codingProfile.findUnique({ where: { platform: 'leetcode' } }),
            prisma.certification.findMany({ select: { title: true, organization: true } }),
        ]);

        const codingProfile = codingProfileData as any;

        // 2. Intelligent Project Matching
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

        // Define Generic Terms to ignore if they are the ONLY matches
        const GENERIC_TERMS = new Set(["file", "download", "pdf", "folder", "document"]);

        // Define Strict Document Types (If user asks for these, the file MUST match)
        const DOCUMENT_TYPES = new Set(["syllabus", "notes", "question", "paper", "exam", "pyq", "lab", "experiment", "practical", "assignment", "semester", "sem"]);

        // Identify "Specific" tokens (Subject/Topic) - anything NOT generic, NOT a type, and NOT a number
        const specificTokens = msgTokens.filter(t => !GENERIC_TERMS.has(t) && !DOCUMENT_TYPES.has(t) && !/\d/.test(t));
        const hasSpecificTokens = specificTokens.length > 0;

        // Identify "Type" tokens (e.g. "syllabus", "pyq")
        const typeTokens = msgTokens.filter(t => DOCUMENT_TYPES.has(t));
        const hasTypeTokens = typeTokens.length > 0;

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

                    // strict filtering:
                    // If the query has specific tokens (e.g. "DevOps"), ensure at least one is matched in the path.
                    // If the query has type tokens (e.g., "PYQ"), ensure at least one is matched in the path.

                    let validMatches = scoredMatches;

                    if (hasSpecificTokens) {
                        validMatches = validMatches.filter(m => {
                            const pathLower = m.path.toLowerCase();
                            // Check if at least ONE specific token is present
                            return specificTokens.some(t => pathLower.includes(t));
                        });
                        console.log(`[ChatAgent] Applied Specific Token Filter (${specificTokens.join(", ")}). Remaining: ${validMatches.length}`);
                    }

                    if (hasTypeTokens) {
                        validMatches = validMatches.filter(m => {
                            const pathLower = m.path.toLowerCase();
                            // Check if at least ONE type token exists in the file path
                            return typeTokens.some(t => pathLower.includes(t));
                        });
                        console.log(`[ChatAgent] Applied Type Token Filter (${typeTokens.join(", ")}). Remaining: ${validMatches.length}`);
                    }

                    // Strict Threshold
                    // If we filtered by type/specific, we can trust the results more, so lower the general score threshold a bit (20).
                    // This allows exact matches like "pyq" (20 pts) to pass if that's all there is.
                    const threshold = 20;
                    validMatches = validMatches.filter(m => m.score >= threshold);

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
