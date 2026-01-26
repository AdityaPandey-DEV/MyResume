
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';

export async function generateEnhancedDescription(currentDescription: string, readmeContext?: string) {
    const prompt = `
      You are an expert technical writer. Rewrite the following project description based on the provided README context.
      - Make it professional, high-impact, and suitable for a senior developer resume.
      - FOCUS on what the project actually achieves according to the README.
      
      Original Description (Fallback): ${currentDescription}
      ${readmeContext ? `PRIMARY CONTEXT FROM README:
      ${readmeContext.substring(0, 2000)}` : ''}
      
      OUTPUT RULES:
      1. Return ONLY the rewritten description text.
      2. STRICT WORD LIMIT: Under 30 words.
      3. No quotes, no intro text, no formatting.
    `;

    // 1. Try Groq First
    if (process.env.GROQ_API_KEY) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
            });
            const result = completion.choices[0]?.message?.content?.trim();
            if (result) {
                console.log("✅ Groq Enhanced Description Success");
                return result;
            }
        } catch (e) {
            console.warn("⚠️ Groq Failed, falling back to Gemini", e);
        }
    }

    // 2. Fallback to Gemini
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini Generation Error:', error);
        return null; // Fallback to original
    }
}

export async function generateFeaturedDetails(readmeContext: string) {
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

    // 1. Try Groq First
    if (process.env.GROQ_API_KEY) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt + "\nReturn ONLY valid JSON." }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                response_format: { type: "json_object" }
            });
            const result = completion.choices[0]?.message?.content?.trim();
            if (result) {
                console.log("✅ Groq Featured Details Success");
                return JSON.parse(result);
            }
        } catch (e) {
            console.warn("⚠️ Groq Failed, falling back to Gemini", e);
        }
    }

    // 2. Fallback to Gemini
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
