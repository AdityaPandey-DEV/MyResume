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
        // 1. Fetch Truncated Resume Context
        const [projects, skills, experience, codingProfileData, certifications] = await Promise.all([
            prisma.project.findMany({ select: { title: true, description: true, repoUrl: true } }),
            prisma.skill.findMany({ where: { isActive: true }, select: { name: true, category: true } }),
            prisma.experience.findMany({ select: { position: true, company: true, duration: true } }),
            prisma.codingProfile.findUnique({ where: { platform: 'leetcode' } }),
            prisma.certification.findMany({ select: { title: true, organization: true } }),
        ]);

        const codingProfile = codingProfileData as any;

        // Optimize Context Token Usage
        const context = JSON.stringify({
            projects: projects.slice(0, 8).map((p: any) => {
                let desc = p.description || "No description";
                if (desc.length > 150) desc = desc.substring(0, 150) + "..."; // Truncate
                return `${p.title}: ${desc} (${p.repoUrl || 'N/A'})`;
            }),
            skills: skills.map((s: any) => s.name).join(", "),
            experience: experience.map((e: any) => `${e.position} @ ${e.company} (${e.duration})`),
            certifications: certifications.map((c: any) => `${c.title} by ${c.organization}`),
            leetcode: codingProfile ? `Solved: ${codingProfile.solvedCount}` : "N/A",
        });

        // 1.1 Dynamic Repo Context Injection
        const lowerMsg = message.toLowerCase().substring(0, 500); // Cap user input
        let repoContext = "";

        // Match project names
        const matchedProject = projects.find((p: any) => {
            if (!p.title) return false;
            return lowerMsg.includes(p.title.toLowerCase());
        });

        if (matchedProject && matchedProject.repoUrl) {
            repoContext = `\n\n[Project Identified: ${matchedProject.title}. Repo: ${matchedProject.repoUrl}]`;
        }

        const prompt = SYSTEM_PROMPT.replace('{CONTEXT}', context + repoContext);

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
