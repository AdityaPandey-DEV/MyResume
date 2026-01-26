import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "./prisma";

export async function enhanceContent(text: string, type: 'about' | 'experience' | 'skills' | 'projects' | 'hero-title' | 'hero-description' | 'project-icon' | 'holistic-analysis' | 'career-suggestions' | 'job-outreach'): Promise<string> {
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
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
                
                - Return strictly a JSON object: 
                {
                  "Programming": { "icon": "fa-code", "skills": [{"name": "Skill", "level": 85}, ...], "tags": ["Tag1", ...] },
                  "Frontend": { "icon": "fa-layer-group", "skills": [...], "tags": [...] },
                  "Backend": { "icon": "fa-server", "skills": [...], "tags": [...] },
                  "Tools & DevOps": { "icon": "fa-screwdriver-wrench", "skills": [...], "tags": [...] }
                }
                - Pick top 4-5 core skills for the "skills" list (assign realistic levels 70-95).
                - Put all other relevant skills for that category in the "tags" list as simple strings.
                - Use professional FontAwesome 6 solid icon names.
                - Return ONLY the JSON object.
                
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
            } else if (type as any === 'holistic-analysis') {
                prompt = `
                Analyze the following user data from multiple platforms (LinkedIn, GitHub, LeetCode, Codeforces).
                Generate a comprehensive "Holistic Professional Persona".
                - Return a JSON object with: 
                {
                  "persona": "A professional 2-sentence summary of their unique developer identity.",
                  "strengths": ["Strength 1 (Technical/Competitive)", "Strength 2 (Project/Frontend)", ...],
                  "gaps": ["Missing Skill 1 (e.g., System Design)", "Gap 2 (e.g., No Cloud Cert)", ...],
                  "topTechStack": ["React", "Python", ...],
                  "suggestedFocus": "One clear direction for the next 3 months."
                }
                
                Data Context: "${text}"
                `;
            } else if (type as any === 'career-suggestions') {
                prompt = `
                Based on the following user persona and gaps, suggest 3-4 actionable "Career Upgrades".
                Include at least 2 "trending" skills that are highly relevant to their stack but they haven't mastered yet.
                
                - Return a JSON array of objects:
                [
                  {
                    "type": "course" | "skill" | "dsa" | "trending",
                    "title": "Clear Actionable Title or Skill Name",
                    "description": "Why this is important for THIS user (15 words).",
                    "difficulty": "Beginner" | "Intermediate" | "Advanced",
                    "relevanceScore": 0-100,
                    "actionUrl": "Optional search query"
                  },
                  ...
                ]
                Persona Context: "${text}"
                `;
            } else if (type as any === 'job-outreach') {
                prompt = `
                Based on the user's holistic professional persona and the provided job/HR details:
                Generate 3 distinct outreach messages:
                1. A professional Referral Email (Subject + Body).
                2. A personalized LinkedIn Referral Message (max 100 words).
                3. A concise LinkedIn Connection Note (max 300 characters).
                
                - Highlight specific strengths (GitHub projects, LeetCode rank, etc.) relevant to the company.
                - Use a professional yet conversational tone.
                - Return strictly a JSON object: 
                {
                  "referralEmail": "Subject: ...\\n\\nDear...",
                  "referralLinkedIn": "Hi [Name], I've been following [Company]...",
                  "connectionNote": "Hi [Name], I'm a developer specializing in [Tech]..."
                }
                
                User Context: "${text}"
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

            // More robust JSON extraction for structured types
            if (type === 'skills' || type === 'holistic-analysis' || type === 'career-suggestions' || type === 'job-outreach') {
                const jsonMatch = enhanced.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    enhanced = jsonMatch[0];
                }
            }

            // Remove markdown formatting if any (like ** or *)
            enhanced = enhanced.replace(/\*\*/g, '').replace(/\*/g, '');

            return enhanced;

        } catch (error: any) {
            console.warn(`Gemini Enhancement Attempt ${attempt} failed:`, error.message);
            if (error.response) console.error("Gemini Error Response:", JSON.stringify(error.response, null, 2));
            lastError = error;

            // Check for Rate Limit (429) or Overloaded (503)
            if (error.message?.includes('429') || error.message?.includes('503')) {
                // Wait before retrying (Exponential backoff: 2s, 4s, 8s)
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            // If it's a quota error, return a specific string for the API to handle
            if (error.message?.includes('429')) {
                console.error("Gemini Quota Exceeded for today.");
                return "API_QUOTA_EXCEEDED";
            }

            // If it's another error (like 400 Bad Request), break immediately
            console.error("Breaking due to non-retryable error:", error);
            break;
        }
    }

    console.error("Gemini Enhancement failed. Returning original text.");
    return text;
}
