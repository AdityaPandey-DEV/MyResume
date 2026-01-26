import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

export async function enhanceContent(text: string, type: 'about' | 'experience' | 'skills' | 'projects' | 'hero-title' | 'hero-description' | 'project-icon'): Promise<string> {
    let apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        const keySetting = await prisma.adminSettings.findUnique({
            where: { key: 'GEMINI_API_KEY' },
        });
        apiKey = keySetting?.value;
    }

    if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing. Returning original text (truncated).");
        // Safe fallback for hero/experience
        if (type === 'hero-description') return text.substring(0, 150) + '...';
        return text;
    }

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genAI = new GoogleGenerativeAI(apiKey as string);
            // gemini-2.5-flash passed the quota check
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = "";

            if (type === 'about') {
                prompt = `
                You are an expert SEO copywriter for developer resumes.
                Rewrite the following "About Me" journey section.
                - Keep it professional and engaging.
                - Return EXACTLY 3 short paragraphs.
                - Each paragraph must be under 50 words.
                - Use the first person ("I").
                
                Original Text: "${text}"
                `;
            } else if (type === 'experience') {
                prompt = `
                Rewrite the following job description to use strong action verbs.
                - Keep it under 40 words.
                - Highlight technical impact and quantifiable results.
                
                Original Text: "${text}"
                `;
            } else if (type === 'skills') {
                prompt = `
                Categorize the following technical skills into these 4 EXACT categories: 
                "Programming", "Frontend", "Backend", "Tools & DevOps".
                
                - Return strictly a JSON object: {"Programming": ["Skill1", ...], "Frontend": [...], "Backend": [...], "Tools & DevOps": [...]}
                - Top 5-6 most relevant skills per category.
                - Keep skill names short.
                
                Original List: "${text}"
                `;
            } else if (type as any === 'hero-title') {
                prompt = `
                Generate a professional software developer headline (Hero Title).
                - Keep it STRICTLY under 8 words.
                - Return ONLY the raw string. No quotes, no intro, no "Option 1", no numbered lists.
                - Use symbols like | or & if needed.
                - Example: "B.Tech CSE Student & Full Stack Developer"
                
                Original Headline: "${text}"
                `;
            } else if (type as any === 'hero-description') {
                prompt = `
                Generate a catchy 1-sentence bio (Hero Description).
                - Keep it STRICTLY under 25 words.
                - Return ONLY the raw string. No quotes, no intro.
                - Focus on passion and technology.
                
                Original Bio: "${text}"
                `;
            } else if (type as any === 'projects') {
                prompt = `
                Generate a concise summary for this project.
                - Keep it under 30 words.
                - Focus on what the project DOES and the IMPACT.
                
                Original Description: "${text}"
                `;
            } else if (type as any === 'project-icon') {
                prompt = `
                Find the single most suitable FontAwesome 6 (solid) icon name for this project.
                - Return ONLY the icon name (e.g., "fa-cloud", "fa-code", "fa-lock", "fa-brain"). No "fa-solid" prefix.
                - Focus on the PROJECT PURPOSE.
                - Example: Weather App -> "fa-sun", Security App -> "fa-shield-halved", Calculator -> "fa-calculator".
                
                Project Info: "${text}"
                `;
            }

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let enhanced = response.text().trim();

            // Remove markdown formatting if any (like ** or *)
            enhanced = enhanced.replace(/\*\*/g, '').replace(/\*/g, '');

            return enhanced;

        } catch (error: any) {
            console.warn(`Gemini Enhancement Attempt ${attempt} failed:`, error.message);
            lastError = error;

            // Check for Rate Limit (429) or Overloaded (503)
            if (error.message?.includes('429') || error.message?.includes('503')) {
                // Wait before retrying (Exponential backoff: 2s, 4s, 8s)
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // If it's another error (like 400 Bad Request), break immediately
            break;
        }
    }

    console.error("Gemini Enhancement failed after retries. Returning original text.");
    return text;
}
