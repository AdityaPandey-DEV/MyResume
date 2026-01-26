import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const sessionId = params.id;

        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });

        if (messages.length === 0) {
            return NextResponse.json({ summary: "No messages to summarize." });
        }

        const transcript = messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
        const prompt = `Summarize the following chat between a recruiter/visitor and Aditya's AI Assistant. Highlight key questions asked and the interest level.\n\n${transcript}`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        return NextResponse.json({ summary });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
