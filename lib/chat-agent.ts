import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

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
- **Projects**: Use the provided Github Repo URLs if asked for source code.
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
        const [about, projects, skills, experience, codingProfileData] = await Promise.all([
            prisma.about.findFirst({ include: { values: true, focusAreas: true, journey: true } }),
            prisma.project.findMany(),
            prisma.skill.findMany({ where: { isActive: true }, include: { category: true } }),
            prisma.experience.findMany(),
            prisma.codingProfile.findUnique({ where: { platform: 'leetcode' } }),
        ]);

        const codingProfile = codingProfileData as any; // forceful type assertion to fix build

        const context = JSON.stringify({
            about,
            projects: projects.map((p: any) => p.title + ": " + p.description + " (Repo: " + (p.repoUrl || 'N/A') + ")"),
            skills: skills.map((s: any) => s.name),
            experience: experience.map((e: any) => `${e.position} at ${e.company}`),
            leetcode: codingProfile ? `Solved: ${codingProfile.solvedCount} (Easy: ${codingProfile.easySolved}, Medium: ${codingProfile.mediumSolved}, Hard: ${codingProfile.hardSolved})` : "LeetCode data unavailable",
        });

        const prompt = SYSTEM_PROMPT.replace('{CONTEXT}', context);

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
        } catch (groqError) {
            console.warn("Groq failed, falling back to Gemini:", groqError);

            // 4. Fallback to Gemini 2.0 Flash
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: prompt }] },
                    { role: "model", parts: [{ text: "Understood. I am Aditya Pandey. ready to chat." }] },
                    ...chatHistory.map((h: { role: string; content: string }) => ({
                        role: h.role === 'user' ? 'user' : 'model',
                        parts: [{ text: h.content }]
                    }))
                ],
            });

            const result = await chat.sendMessage(message);
            return result.response.text();
        }

    } catch (error) {
        console.error("Chat Agent Error:", error);
        return "I'm currently offline (Server Error). Please email me instead!";
    }
}
