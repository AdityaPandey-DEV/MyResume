
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getScreenshotUrl } from '@/lib/meta-helper';

export async function POST(req: Request) {
    try {
        const { projectId, liveDemoUrl } = await req.json();

        if (!projectId || !liveDemoUrl) {
            return NextResponse.json({ error: 'Missing projectId or liveDemoUrl' }, { status: 400 });
        }

        const imageUrl = getScreenshotUrl(liveDemoUrl);

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                imageUrl: imageUrl,
                updatedAt: new Date(),
            }
        });

        return NextResponse.json({ success: true, imageUrl });

    } catch (error: any) {
        console.error('Image Sync Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to sync image' }, { status: 500 });
    }
}
