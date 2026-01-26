import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.roadmapItem.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json({ success: true, items });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const item = await prisma.roadmapItem.create({
            data: {
                title: data.title,
                description: data.description,
                targetDate: data.targetDate,
                type: data.type,
                order: data.order ?? 0,
                isCompleted: false
            }
        });
        return NextResponse.json({ success: true, item });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, ...data } = await req.json();
        const item = await prisma.roadmapItem.update({
            where: { id },
            data
        });
        return NextResponse.json({ success: true, item });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
