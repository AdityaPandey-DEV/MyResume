import { GoogleGenerativeAI } from "@google/generative-ai";

export async function enhanceContent(text: string, type: 'about' | 'experience' | 'skills'): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. Returning original text.");
        return text;
    }

    const MAX_RETRIES = 3;
    let lastError;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // gemini-2.5-flash passed the quota check
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            let prompt = "";

            if (type === 'about') {
                prompt = `
                You are an expert SEO copywriter for developer resumes.
                Rewrite the following "About Me" section to be professional, engaging, and SEO-optimized for a software engineer.
                Keep it under 600 characters. Use the first person ("I").
                
                Original Text: "${text}"
                `;
            } else if (type === 'experience') {
                prompt = `
                Rewrite the following job description to use strong action verbs and highlight technical achievements.
                Keep it concise.
                
                Original Text: "${text}"
                `;
            } else if (type === 'skills') {
                prompt = `
                Categorize and clean up the following list of technical skills.
                Return ONLY a comma-separated list of the top 20 most relevant/modern skills for a Full Stack Developer.
                Remove duplicates and vague terms.
                
                Original List: "${text}"
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
