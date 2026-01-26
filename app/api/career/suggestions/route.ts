import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enhanceContent } from '@/lib/gemini-enhancer';

export async function GET() {
    try {
        // 1. Fetch Holistic Data
        const hero = await prisma.hero.findFirst();
        const profiles = await prisma.codingProfile.findMany();
        const certs = await prisma.certification.findMany({ where: { isVisible: true } });
        const projects = await prisma.project.findMany({ where: { isVisible: true } });
        const experience = await prisma.experience.findMany();

        const context = {
            bio: hero?.description,
            title: hero?.title,
            codingProfiles: profiles.map(p => ({
                platform: p.platform,
                rating: p.rating,
                solved: p.solvedCount,
                rank: p.rank
            })),
            certifications: certs.map(c => c.title),
            projects: projects.map(p => ({ title: p.title, tech: p.technologies })),
            experience: experience.map(e => ({ title: e.position, company: e.company }))
        };

        const contextString = JSON.stringify(context);

        // 2. Perform Holistic Analysis
        const analysisRaw = await enhanceContent(contextString, 'holistic-analysis');
        const analysis = JSON.parse(analysisRaw);

        // Save Analysis
        await prisma.userAnalysis.deleteMany({}); // Keep only latest
        const userAnalysis = await prisma.userAnalysis.create({
            data: {
                holisticPersona: analysis.persona,
                strengths: analysis.strengths,
                gaps: analysis.gaps,
                topTechStack: analysis.topTechStack,
                suggestedFocus: analysis.suggestedFocus
            }
        });

        // 3. Generate Career Suggestions
        const suggestionsRaw = await enhanceContent(JSON.stringify(analysis), 'career-suggestions');
        const suggestions = JSON.parse(suggestionsRaw);

        // Save Suggestions
        await prisma.careerSuggestion.deleteMany({});
        for (const sugg of suggestions) {
            await prisma.careerSuggestion.create({
                data: {
                    type: sugg.type,
                    title: sugg.title,
                    description: sugg.description,
                    difficulty: sugg.difficulty,
                    relevanceScore: sugg.relevanceScore,
                    actionUrl: sugg.actionUrl
                }
            });
        }

        return NextResponse.json({ success: true, analysis: userAnalysis, suggestions });

    } catch (error: any) {
        console.error("Career Suggestion Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
