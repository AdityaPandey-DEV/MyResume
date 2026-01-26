import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const sessions = await prisma.chatSession.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' }, // Latest message first for preview
                    take: 1
                }
            }
        });

        // We need to fetch full messages when selected, but for list we just need preview
        // Adjust logic if needed to fetch full messages on selection in frontend
        // For now returning full structure but optimize later if needed

        // Actually for the detail view we need all messages. 
        // Let's modify the query to return simplified list or just fetch all for now (low volume).
        const fullSessions = await prisma.chatSession.findMany({
            orderBy: { updatedAt: 'desc' },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' } // Chronological for chat view
                }
            }
        });

        return NextResponse.json(fullSessions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
