
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Get username from AdminSettings
    const usernameSetting = await prisma.adminSettings.findUnique({
      where: { key: 'LEETCODE_USERNAME' },
    });

    if (!usernameSetting?.value) {
      return NextResponse.json({ error: 'LeetCode username not configured' }, { status: 400 });
    }

    const username = usernameSetting.value;

    // 2. Fetch data from LeetCode GraphQL
    const query = `
      query userProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          profile {
            ranking
            reputation
            starRating
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();

    if (data.errors) {
       return NextResponse.json({ error: data.errors[0].message }, { status: 500 });
    }

    const stats = data.data.matchedUser.submitStats.acSubmissionNum;
    const profile = data.data.matchedUser.profile;

    const totalSolved = stats.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easySolved = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    // 3. Update or Create CodingProfile
    const updatedProfile = await prisma.codingProfile.upsert({
      where: { platform: 'leetcode' },
      update: {
        username: username,
        solvedCount: totalSolved,
        easySolved: easySolved,
        mediumSolved: mediumSolved,
        hardSolved: hardSolved,
        // Leetcode doesn't expose strict "rating" easily in public graphQL without contest query, 
        // but we can use reputation or ranking specific fields if needed. 
        // For now, mapping Ranking to globalRank
        globalRank: profile.ranking,
        lastSyncedAt: new Date(),
      },
      create: {
        platform: 'leetcode',
        username: username,
        solvedCount: totalSolved,
        easySolved: easySolved,
        mediumSolved: mediumSolved,
        hardSolved: hardSolved,
        globalRank: profile.ranking,
      },
    });

    return NextResponse.json({ success: true, data: updatedProfile });

  } catch (error) {
    console.error('LeetCode Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync LeetCode data' }, { status: 500 });
  }
}
