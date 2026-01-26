import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { title, type } = await req.json();

        // 1. Find or create a "Trending / Suggested" category
        let category = await prisma.skillCategory.findFirst({
            where: { title: 'Trending & Learning' }
        });

        if (!category) {
            category = await prisma.skillCategory.create({
                data: {
                    title: 'Trending & Learning',
                    icon: 'fa-arrow-trend-up',
                    order: 99 // Last
                }
            });
        }

        // 2. Add as DEACTIVATED skill
        const skill = await prisma.skill.create({
            data: {
                name: title,
                categoryId: category.id,
                level: 30, // Default low level for "Learning"
                isActive: false,
                isTrending: true,
                order: 0
            }
        });

        return NextResponse.json({ success: true, skill });

    } catch (error: any) {
        console.error("Add Skill Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
