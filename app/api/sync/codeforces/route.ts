import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const usernameSetting = await prisma.adminSettings.findUnique({
            where: { key: 'CODEFORCES_USERNAME' },
        });

        if (!usernameSetting?.value) {
            return NextResponse.json({ error: 'Codeforces username not configured' }, { status: 400 });
        }

        const username = usernameSetting.value;

        // Fetch User Info
        const infoResponse = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const infoData = await infoResponse.json();

        if (infoData.status !== 'OK') {
            return NextResponse.json({ error: 'Failed to fetch Codeforces user info' }, { status: 500 });
        }

        const userMap = infoData.result[0];

        // Upsert CodingProfile
        const updatedProfile = await prisma.codingProfile.upsert({
            where: { platform: 'codeforces' },
            update: {
                username: username,
                rating: userMap.rating,
                maxRating: userMap.maxRating,
                rank: userMap.rank,
                lastSyncedAt: new Date(),
            },
            create: {
                platform: 'codeforces',
                username: username,
                rating: userMap.rating,
                maxRating: userMap.maxRating,
                rank: userMap.rank,
            },
        });

        revalidatePath('/');
        return NextResponse.json({ success: true, data: updatedProfile });

    } catch (error) {
        console.error('Codeforces Sync Error:', error);
        return NextResponse.json({ error: 'Failed to sync Codeforces data' }, { status: 500 });
    }
}
