import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateChatResponse } from '@/lib/chat-agent';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { message, sessionId: clientSessionId } = await req.json();

        // 1. Resolve Session ID (Cookie or Client-provided)
        let sessionId = clientSessionId;
        if (!sessionId) {
            const cookieStore = await cookies();
            sessionId = cookieStore.get('chat_session_id')?.value;
        }

        // 2. Create Session if not exists
        let session = null;
        if (sessionId) {
            session = await prisma.chatSession.findUnique({
                where: { id: sessionId },
            });
        }

        if (!session) {
            session = await prisma.chatSession.create({
                data: {
                    visitorId: 'anonymous-' + Date.now(), // Simplified for now
                    userName: 'Visitor',
                },
            });
            sessionId = session.id;
        }

        // 3. Save User Message
        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'user',
                content: message,
            },
        });

        // 4. Generate AI Response
        const aiResponse = await generateChatResponse(message, sessionId);

        // 5. Save AI Message
        await prisma.chatMessage.create({
            data: {
                sessionId,
                role: 'assistant',
                content: aiResponse,
            },
        });

        // 6. Return Response
        return NextResponse.json({
            reply: aiResponse,
            sessionId
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
    }
}
