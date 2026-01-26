import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enhanceContent } from '@/lib/gemini-enhancer';

export async function POST(req: Request) {
    try {
        const { jobId } = await req.json();

        // 1. Fetch Holistic context (similar to career-suggestions)
        const hero = await prisma.hero.findFirst();
        const profiles = await prisma.codingProfile.findMany();
        const projects = await prisma.project.findMany({ where: { isVisible: true } });

        const job = await prisma.targetJob.findUnique({
            where: { id: jobId }
        });

        if (!job) return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });

        const context = {
            user: {
                name: hero?.name,
                title: hero?.title,
                codingProfiles: profiles.map(p => ({ platform: p.platform, rating: p.rating, rank: p.rank })),
                topProjects: projects.slice(0, 3).map(p => ({ title: p.title, tech: p.technologies }))
            },
            job: {
                company: job.company,
                role: job.role,
                hrName: job.hrName
            }
        };

        // 2. Generate Outreach
        const outreachRaw = await enhanceContent(JSON.stringify(context), 'job-outreach');
        const outreach = JSON.parse(outreachRaw);

        // 3. Update Job
        const updatedJob = await prisma.targetJob.update({
            where: { id: jobId },
            data: {
                referralEmail: outreach.referralEmail,
                referralLinkedIn: outreach.referralLinkedIn,
                connectionNote: outreach.connectionNote
            }
        });

        return NextResponse.json({ success: true, job: updatedJob });

    } catch (error: any) {
        console.error("Outreach Generation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
