
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bulkSyncGithubProjects } from '@/lib/github-bulk-sync';

export async function POST(req: Request) {
    try {
        // 1. Get GitHub Username
        const setting = await prisma.adminSettings.findUnique({
            where: { key: 'GITHUB_USERNAME' }
        });

        if (!setting?.value) {
            return NextResponse.json({ error: 'GitHub Username not configured' }, { status: 400 });
        }

        const results = await bulkSyncGithubProjects(setting.value);

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Bulk GitHub Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to sync projects' }, { status: 500 });
    }
}
