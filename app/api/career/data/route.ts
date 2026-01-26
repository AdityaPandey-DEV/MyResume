import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const analysis = await prisma.userAnalysis.findFirst({
            orderBy: { analysisDate: 'desc' }
        });
        const suggestions = await prisma.careerSuggestion.findMany({
            orderBy: { relevanceScore: 'desc' }
        });

        return NextResponse.json({ success: true, analysis, suggestions });

    } catch (error: any) {
        console.error("Career Data Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
