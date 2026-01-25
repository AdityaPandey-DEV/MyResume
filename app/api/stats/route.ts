
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Revalidate every minute

export async function GET() {
    try {
        const leetcode = await prisma.codingProfile.findUnique({
            where: { platform: 'leetcode' }
        });

        const codeforces = await prisma.codingProfile.findUnique({
            where: { platform: 'codeforces' }
        });

        return NextResponse.json({
            leetcode: leetcode ? {
                platform: 'leetcode',
                solved: leetcode.solvedCount,
                easy: leetcode.easySolved,
                medium: leetcode.mediumSolved,
                hard: leetcode.hardSolved,
                globalRank: leetcode.globalRank,
            } : null,
            codeforces: codeforces ? {
                platform: 'codeforces',
                rating: codeforces.rating,
                rank: codeforces.rank,
                // maxRating: codeforces.maxRating,
            } : null
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
