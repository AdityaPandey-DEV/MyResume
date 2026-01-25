
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';


import { fetchGithubReadme } from '@/lib/github-utils';

export async function POST(req: Request) {

    try {
        const { projectId, currentDescription, repoUrl } = await req.json();

        let readmeContext = '';
        if (repoUrl) {
            const fetchedReadme = await fetchGithubReadme(repoUrl);
            if (fetchedReadme) {
                readmeContext = fetchedReadme;
            }
        }

        // Get API Key
        const keySetting = await prisma.adminSettings.findUnique({
            where: { key: 'GEMINI_API_KEY' },
        });

        if (!keySetting?.value) {
            return NextResponse.json({ error: 'Gemini API Key not configured' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(keySetting.value);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an expert technical writer. Rewrite the following project description to be professional, impactful, and suitable for a FAANG-level resume.
      
      Original Description: ${currentDescription || 'No description provided.'}
      
      ${readmeContext ? `Context from README: ${readmeContext.substring(0, 1000)}...` : ''}
      
      Output only the rewritten description. Keep it under 50 words.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ success: true, description: text });

    } catch (error) {
        console.error('Gemini Gen Error:', error);
        return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }
}

