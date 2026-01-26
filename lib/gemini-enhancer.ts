import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { prisma } from "./prisma";

// Lazy Initialization placeholders
let groq: Groq | null = null;
let genAI: any = null;

export async function enhanceContent(text: string, type: 'about' | 'experience' | 'skills' | 'projects' | 'hero-title' | 'hero-description' | 'project-icon' | 'holistic-analysis' | 'career-suggestions' | 'job-outreach' | 'job-discovery'): Promise<string> {

    // Initialize providers on first call
    if (!groq && process.env.GROQ_API_KEY) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    if (!genAI && process.env.GEMINI_API_KEY) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 1. Core Prompt Generation Logic
    let prompt = "";
    if (type === 'about') {
        prompt = `Rewrite this "About Me" section for a developer resume. Professional, engaging, 3 short paragraphs (<50 words each), 1st person. Text: "${text}"`;
    } else if (type === 'experience') {
        prompt = `Rewrite this job description with strong action verbs. Under 40 words. Highlight impact. Text: "${text}"`;
    } else if (type === 'skills') {
        prompt = `Extract skills from this text (which may be HTML). Return a JSON object where keys are categories (Programming, Frontend, Backend, Tools & DevOps, Cloud, AI/ML, Soft Skills) and values have: { "icon": "font-awesome-class", "skills": [{"name": "Skill Name", "level": 85, "description": "Optional description for soft skills"}], "tags": [] }. Ignore unrelated HTML/CSS. Text: "${text.substring(0, 15000)}"`;
    } else if (type === 'holistic-analysis') {
        prompt = `Analyze user data (LinkedIn, GitHub, LeetCode, Codeforces) and return JSON: { "persona": "2-sentence summary", "strengths": [], "gaps": [], "topTechStack": [], "suggestedFocus": "3-month direction" }. Data: "${text}"`;
    } else if (type === 'career-suggestions') {
        prompt = `Suggest 3-4 actionable "Career Upgrades" based on this persona. Return JSON array: [{ "type": "course"|"skill"|"dsa"|"trending", "title": "", "description": "15 words", "difficulty": "Beginner"|"Intermediate"|"Advanced", "relevanceScore": 0-100, "actionUrl": "" }]. Context: "${text}"`;
    } else if (type === 'job-outreach') {
        prompt = `Generate 3 outreach messages (Referral Email, LinkedIn Message, Connection Note) as JSON: { "referralEmail": "", "referralLinkedIn": "", "connectionNote": "" }. Context: "${text}"`;
    } else if (type === 'hero-title') {
        prompt = `Generate a developer headline (<8 words). String only. Text: "${text}"`;
    } else if (type === 'hero-description') {
        prompt = `Generate a catchy 1-sentence bio (<25 words). String only. Text: "${text}"`;
    } else if (type === 'project-icon') {
        prompt = `Return ONLY a FontAwesome 6 solid icon name for this project: "${text}"`;
    } else if (type === 'job-discovery') {
        prompt = text; // The caller provides the full prompt
    }

    // 2. Try Groq (Llama 3.1 70B) - Much faster and higher free limits
    if (groq) {
        try {
            const isJsonType = (type === 'skills' || type === 'holistic-analysis' || type === 'career-suggestions' || type === 'job-outreach' || type === 'job-discovery');
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt + (isJsonType ? "\nReturn ONLY the requested format (raw text or JSON block), no conversational filler." : "") }],
                model: "llama-3.3-70b-versatile",
                temperature: 0.5,
                response_format: isJsonType ? { type: "json_object" } : undefined,
            });

            let result = chatCompletion.choices[0]?.message?.content?.trim() || "";
            if (result) {
                console.log(`✅ Groq Success for ${type}`);
                return result;
            }
        } catch (e: any) {
            console.warn(`⚠️ Groq failed for ${type}:`, e.message);
        }
    }

    // 3. Fallback to Gemini 2.0 Flash
    if (genAI) {
        try {
            console.log(`[AI] Falling back to Gemini for ${type}...`);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const result = await model.generateContent(prompt);
            let enhanced = (await result.response).text().trim();

            // Extract JSON if needed
            if (type === 'skills' || type === 'holistic-analysis' || type === 'career-suggestions' || type === 'job-outreach' || type === 'job-discovery') {
                const jsonMatch = enhanced.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) enhanced = jsonMatch[0];
            }

            console.log(`✅ Gemini Success for ${type}`);
            return enhanced;
        } catch (e: any) {
            console.error(`❌ Gemini Fallback failed for ${type}:`, e.message);

            if (e.message?.includes('429')) return "API_QUOTA_EXCEEDED";
        }
    }

    return text; // Final fallback
}
