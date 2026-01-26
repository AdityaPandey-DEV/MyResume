import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const jobs = await prisma.targetJob.findMany({
            orderBy: { createdAt: 'desc' }
        });
        const profile = await prisma.jobHunterProfile.findFirst();

        return NextResponse.json({ success: true, jobs, profile });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const job = await prisma.targetJob.create({
            data: {
                company: data.company,
                role: data.role,
                location: data.location,
                jobUrl: data.jobUrl,
                hrName: data.hrName,
                hrEmail: data.hrEmail,
                hrLinkedIn: data.hrLinkedIn,
                status: 'Saved'
            }
        });
        return NextResponse.json({ success: true, job });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
