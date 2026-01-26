
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEnhancedDescription } from '@/lib/gemini';
import { fetchGithubReadme } from '@/lib/github-utils';

export async function POST(req: Request) {
    try {
        const { currentDescription, repoUrl } = await req.json();

        let readmeContext = '';
        if (repoUrl) {
            const fetchedReadme = await fetchGithubReadme(repoUrl);
            if (fetchedReadme) {
                readmeContext = fetchedReadme;
            }
        }

        const text = await generateEnhancedDescription(currentDescription || '', readmeContext);

        if (!text) {
            return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
        }

        return NextResponse.json({ success: true, description: text });

    } catch (error) {
        console.error('Gemini Gen Error:', error);
        return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }
}

