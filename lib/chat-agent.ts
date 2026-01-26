import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { chatQueue } from './rate-limiter';
import { fetchRepoFileTree } from './github-utils';

// Initialize Clients
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Persona System Prompt
const SYSTEM_PROMPT = `
You are Aditya Pandey, a passionate B.Tech CSE student and Full Stack Developer. 
Your goal is to chat with visitors on your portfolio website as if you are Aditya himself.

# Your Persona:
- Friendly, professional, and enthusiastic about technology to recruiters and peers.
- "WhatsApp" chat style: Short, conversational, occasional emojis, but professional.
- Skills: React, Next.js, Node.js, AI/ML (Gemini, Groq), PostgreSQL, Prisma.
- Context: You are currently a student at Parul University. This is your portfolio website.

# Instructions:
- Answer questions based ONLY on the provided Resume Context.
- **Projects**: Use the provided Github Repo URLs if asked for source code. **IMPORTANT:** If the user asks about a project by name (e.g., "PYQ"), check the Project List for matches (e.g., "PYQ-GEHU") even if the description is missing or generic.
- **LeetCode/DSA**: You check the "LeetCode" stats. You can conceptually explain any problem, but only claim "I have solved this" if it fits within your solved usage (approx matches your solved count).
- If asked about something not in the context, say you can't recall right now or ask them to email you.
- Be helpful to recruiters (HR).
- Keep responses concise (like a chat message).
- Do not say "I am an AI". Act as the digital version of Aditya.

# Resume Context:
{CONTEXT}
`;

export async function generateChatResponse(message: string, sessionId: string) {
    try {
        // 1. Fetch Resume Context (Cached or fresh)
        // For now, we'll fetch dynamic parts. 
        // Optimization: You could cache this string.
        const [about, projects, skills, experience, codingProfileData, certifications] = await Promise.all([
            prisma.about.findFirst({ include: { values: true, focusAreas: true, journey: true } }),
            prisma.project.findMany(),
            prisma.skill.findMany({ where: { isActive: true }, include: { category: true } }),
            prisma.experience.findMany(),
            prisma.codingProfile.findUnique({ where: { platform: 'leetcode' } }),
            prisma.certification.findMany(),
        ]);

        const codingProfile = codingProfileData as any;

        const context = JSON.stringify({
            about,
            projects: projects.map((p: any) => {
                const garbagePrefixes = [
                    "It seems like you didn't type anything",
                    "It looks like you didn't type anything",
                    "It looks like you didn't ask a question",
                    "It seems like you didn't ask a question",
                    "It seems like you didn't provide any text",
                    "No description provided",
                    "It looks like you may have sent an empty message"
                ];

                let desc = p.description || "No description available";
                if (garbagePrefixes.some(prefix => desc.startsWith(prefix))) {
                    desc = "No description available";
                }

                return `Title: ${p.title} | Description: ${desc} | Repo: ${p.repoUrl || 'N/A'}`;
            }),
            skills: skills.map((s: any) => s.name),
            experience: experience.map((e: any) => `${e.position} at ${e.company}`),
            certifications: certifications.map((c: any) => `${c.name} by ${c.issuer} (${c.date})`),
            leetcode: codingProfile ? `Solved: ${codingProfile.solvedCount} (Easy: ${codingProfile.easySolved}, Medium: ${codingProfile.mediumSolved}, Hard: ${codingProfile.hardSolved})` : "LeetCode data unavailable",
        });

        // 1.1 Dynamic Repo Context Injection
        // Check if user is asking about a specific project
        const lowerMsg = message.toLowerCase();
        let repoContext = "";

        // Find matched project: Strict Name Match OR Keyword Match (e.g. "PYQ" in "PYQ-GEHU")
        const msgTokens = lowerMsg.split(/[^a-z0-9]+/).filter(t => t.length > 2);

        const matchedProject = projects.find((p: any) => {
            if (!p.title || !p.repoUrl) return false;
            const titleLower = p.title.toLowerCase();
            const titleTokens = titleLower.split(/[^a-z0-9]+/).filter((t: string) => t.length > 2);

            // Match if full title is in message OR valid intersection of keywords
            return lowerMsg.includes(titleLower) ||
                titleTokens.some((t: string) => msgTokens.includes(t));
        });

        if (matchedProject && matchedProject.repoUrl) {
            console.log(`Deep searching repo for: ${matchedProject.title}`);
            const filePaths = await fetchRepoFileTree(matchedProject.repoUrl);

            if (filePaths && filePaths.length > 0) {
                // Smart Search: Filter files based on User's Query
                const relevantFiles = filePaths.filter(path => {
                    const lowerPath = path.toLowerCase();
                    const isRoot = !path.includes('/');
                    const matchesQuery = msgTokens.some(token => lowerPath.includes(token));
                    return isRoot || matchesQuery;
                });

                // ALGORITHMIC BYPASS: Check for specific keyword matches (excluding root files if they don't match)
                const keywordMatches = relevantFiles.filter(f => msgTokens.some(t => f.toLowerCase().includes(t)));

                if (keywordMatches.length > 0) {
                    const matchCount = keywordMatches.length;
                    const displayFiles = keywordMatches
                        .slice(0, 10)
                        .map(f => `- [${f.split('/').pop()}](${matchedProject.repoUrl}/blob/main/${f})`)
                        .join('\n');

                    const moreText = matchCount > 10 ? `\n...and ${matchCount - 10} more.` : '';
                    return `I found ${matchCount} relevant files in **${matchedProject.title}** matching your query:\n\n${displayFiles}${moreText}\n\nYou can view them directly on GitHub! 🚀\n(This search was performed algorithmically to save time.)`;
                }

                // If we have a project match but no file matches, return early too (Don't waste AI tokens on "I couldn't find it")
                repoContext = `\n\n# NOTE: Checked project "${matchedProject.title}" but found no files matching keywords: ${msgTokens.join(', ')}.`;

                // STRICT MODE: If user asked for specific keywords and we found the project but no files, 
                // we should probably just say that instead of hallucinating.
                if (msgTokens.length > 0) {
                    return `I checked the **${matchedProject.title}** repository, but I couldn't find any files matching "${msgTokens.join(', ')}". \n\nYou might want to browse the [repo directly](${matchedProject.repoUrl}).`;
                }

            } else {
                return `I found the project **${matchedProject.title}**, but I couldn't access the file list (Github API might be busy). \n\nDirect Link: ${matchedProject.repoUrl}`;
            }
        }

        const prompt = SYSTEM_PROMPT.replace('{CONTEXT}', context + repoContext);

        // 2. Fetch recent chat history (last 10 msgs) for context
        const history = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Reverse to chronological order
        const chatHistory = history.reverse().map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }));

        // 3. Try Groq (Llama 3.3 70B)
        // 3. Execute LLM with Queue and Retry
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

        return await chatQueue.add(async () => {
            // Try Groq
            try {
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: prompt },
                        ...chatHistory as any,
                        { role: 'user', content: message },
                    ],
                    model: 'llama-3.3-70b-versatile',
                    temperature: 0.7,
                    max_tokens: 300,
                });

                return completion.choices[0]?.message?.content || "Hey! I'm a bit busy coding right now, could you ask that again?";
            } catch (groqError: any) {
                console.warn("Groq failed or Rate Limited, falling back to Gemini.");

                // Fallback to Gemini with Retry
                const maxRetries = 2;
                let retryCount = 0;

                while (retryCount <= maxRetries) {
                    try {
                        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

                        const geminiHistory = [
                            { role: "user", parts: [{ text: prompt }] },
                            { role: "model", parts: [{ text: "Understood. I am Aditya Pandey. ready to chat." }] }
                        ];

                        let lastRole = 'model';
                        chatHistory.forEach(h => {
                            const currentRole = h.role === 'user' ? 'user' : 'model';
                            if (currentRole !== lastRole) {
                                geminiHistory.push({
                                    role: currentRole,
                                    parts: [{ text: h.content }]
                                });
                                lastRole = currentRole;
                            }
                        });

                        const chat = model.startChat({
                            history: geminiHistory,
                        });

                        const result = await chat.sendMessage(message);
                        return result.response.text();

                    } catch (geminiError: any) {
                        console.error(`Gemini Attempt ${retryCount + 1} failed:`, geminiError.message);

                        const isRateLimit = geminiError.message?.includes('429') || geminiError.message?.includes('Quota exceeded');

                        if (isRateLimit && retryCount < maxRetries) {
                            console.log("Gemini Rate Limit hit. Waiting 25s before retry...");
                            await delay(25000);
                            retryCount++;
                            continue;
                        }

                        if (isRateLimit) {
                            return "I'm receiving too many messages right now! 🚦 Please give me 30 seconds to catch up.";
                        }

                        throw geminiError;
                    }
                }
                return "System Error: Both AI models are currently unavailable due to high traffic.";
            }
        });

    } catch (error) {
        console.error("Chat Agent Error:", error);
        return "I'm currently offline (Server Error). Please email me instead!";
    }
}
