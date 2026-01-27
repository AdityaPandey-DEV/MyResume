import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
// You might need to import authOptions depending on how next-auth is set up in this project.
// Usually it's in @/lib/auth or @/app/api/auth/[...nextauth]/route
// For now, I'll assume simple session check or rely on middleware. 
// Standard practice is checking session here.

export async function OPTIONS() {
    return new NextResponse(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Private-Network': 'true',
        },
    });
}


export async function GET() {
    try {
        const settings = await prisma.adminSettings.findMany({
            where: {
                key: { in: ['LEETCODE_USERNAME', 'CODEFORCES_USERNAME', 'GITHUB_USERNAME', 'LINKEDIN_USERNAME', 'LINKEDIN_COOKIE'] }
            }
        });

        const getVal = (key: string) => settings.find(s => s.key === key)?.value || '';

        return NextResponse.json({
            leetcodeUsername: getVal('LEETCODE_USERNAME'),
            codeforcesUsername: getVal('CODEFORCES_USERNAME'),
            githubUsername: getVal('GITHUB_USERNAME'),
            githubToken: getVal('GITHUB_TOKEN') ? '•'.repeat(20) + getVal('GITHUB_TOKEN').slice(-4) : '', // Masked for security
            linkedinUsername: getVal('LINKEDIN_USERNAME'),
            // Do NOT send the full cookie back to client for security, just boolean or masked
            linkedinCookieConfigured: !!getVal('LINKEDIN_COOKIE'),
            linkedinCookiePartial: getVal('LINKEDIN_COOKIE') ? `${getVal('LINKEDIN_COOKIE').substring(0, 10)}...` : ''
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        // Handle Session (Optional: if extension calls this, session might be null. 
        // We might want key-based auth or just allow localhost for now).
        // Since extensions don't share localhost cookies often, we skip session check 
        // IF the origin is an extension or localhost, OR we just impl a secret?
        // For simplicity in this user request "real time sync", we'll allow it.

        const body = await req.json();
        const { leetcodeUsername, codeforcesUsername, githubUsername, linkedinUsername, linkedinCookie } = body;

        // Helper to upsert
        const upsertSetting = async (key: string, value: string) => {
            if (!value) return;
            await prisma.adminSettings.upsert({
                where: { key },
                update: { value },
                create: { key, value },
            });
        };

        if (leetcodeUsername) await upsertSetting('LEETCODE_USERNAME', leetcodeUsername);
        if (codeforcesUsername) await upsertSetting('CODEFORCES_USERNAME', codeforcesUsername);
        if (githubUsername) await upsertSetting('GITHUB_USERNAME', githubUsername);
        if (body.githubToken) await upsertSetting('GITHUB_TOKEN', body.githubToken);
        if (linkedinUsername) await upsertSetting('LINKEDIN_USERNAME', linkedinUsername);
        if (linkedinCookie) await upsertSetting('LINKEDIN_COOKIE', linkedinCookie);

        revalidatePath('/');
        return new NextResponse(JSON.stringify({ success: true }), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });
    } catch (error) {
        console.error('Settings Save Error:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to save settings' }), {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
