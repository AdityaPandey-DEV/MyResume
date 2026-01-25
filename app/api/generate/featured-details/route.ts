
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Keep for consistency if we verify auth later
import { generateFeaturedDetails } from '@/lib/gemini';
import { fetchGithubReadme } from '@/lib/github-utils';

export async function POST(req: Request) {
    try {
        const { repoUrl } = await req.json();

        if (!repoUrl) {
            return NextResponse.json({ error: 'Repo URL is required' }, { status: 400 });
        }

        const readme = await fetchGithubReadme(repoUrl);

        if (!readme) {
            return NextResponse.json({ error: 'Could not fetch README from GitHub. Check URL or visibility.' }, { status: 404 });
        }

        const details = await generateFeaturedDetails(readme);

        if (!details) {
            return NextResponse.json({ error: 'Failed to generate details via Gemini' }, { status: 500 });
        }

        return NextResponse.json(details);

    } catch (error) {
        console.error('Featured Gen Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
