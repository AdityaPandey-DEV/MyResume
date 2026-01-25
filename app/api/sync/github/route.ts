import { NextResponse } from 'next/server';
import { syncProjectFromGithub } from '@/lib/github-sync';

export async function POST(req: Request) {
    console.log('API Hit: /api/sync/github');
    try {
        const body = await req.json();
        console.log('Request Body:', body);
        const { repoUrl, projectId } = body;

        if (!repoUrl || !projectId) {
            return NextResponse.json({ error: 'Missing repoUrl or projectId' }, { status: 400 });
        }

        const updatedProject = await syncProjectFromGithub(projectId, repoUrl);
        return NextResponse.json({ success: true, data: updatedProject });

    } catch (error: any) {
        console.error('GitHub Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to sync GitHub data' }, { status: 500 });
    }
}
