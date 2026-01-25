
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export async function generateEnhancedDescription(currentDescription: string, readmeContext?: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;

        let validKey = apiKey;

        if (!validKey) {
            const keySetting = await prisma.adminSettings.findUnique({
                where: { key: 'GEMINI_API_KEY' },
            });
            validKey = keySetting?.value;
        }

        if (!validKey) return null;

        const genAI = new GoogleGenerativeAI(validKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert technical writer. Rewrite the following project description to be professional, impactful, and suitable for a FAANG-level resume.
      Focus on technologies, impact, and complexity.
      
      Original Description: ${currentDescription}
      ${readmeContext ? `Context from README: ${readmeContext.substring(0, 500)}...` : ''}
      
      Output only the rewritten description. Keep it concise (under 40 words).
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Generation Error:', error);
        return null; // Fallback to original
    }
}

export async function generateFeaturedDetails(readmeContext: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        let validKey = apiKey;

        if (!validKey) {
            const keySetting = await prisma.adminSettings.findUnique({
                where: { key: 'GEMINI_API_KEY' },
            });
            validKey = keySetting?.value;
        }

        if (!validKey) return null;

        const genAI = new GoogleGenerativeAI(validKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert technical resume writer. Analyze the following project README and extract valuable information for a "Featured Project" spotlight section.

            README Context:
            ${readmeContext.substring(0, 1500)}

            Tasks:
            1. Identify the top 5 most important technologies/frameworks used (e.g., React, Node.js, TensorFlow).
            2. Extract 3-4 distinct "Key Features" or achievements. These should be short, punchy bullet points (under 10 words each).

            Output strictly in JSON format:
            {
                "technologies": ["Tech1", "Tech2", ...],
                "keyFeatures": ["Feature 1", "Feature 2", ...]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini Featured Gen Error:', error);
        return null;
    }
}
