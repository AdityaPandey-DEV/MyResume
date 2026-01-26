
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

        const validKey = await (async () => {
            if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
            const keySetting = await prisma.adminSettings.findUnique({
                where: { key: 'GEMINI_API_KEY' },
            });
            return keySetting?.value;
        })();

        if (!validKey) {
            return NextResponse.json({ error: 'Gemini API Key not configured in Admin Settings' }, { status: 400 });
        }

        const text = await generateEnhancedDescription(currentDescription || '', readmeContext);

        if (!text) {
            return NextResponse.json({ error: 'AI failed to generate a description. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, description: text });

    } catch (error) {
        console.error('Gemini Gen Error:', error);
        return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
    }
}

