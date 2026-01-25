
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeLinkedInProfile } from '@/lib/linkedin-scraper';

export async function POST(req: Request) {
    console.log("DEBUG: API /sync/linkedin HIT");
    try {
        // Check for manual JSON upload or Extension payload
        let body;
        try {
            const rawBody = await req.text();
            console.log("DEBUG: Body size:", rawBody.length);
            if (rawBody) {
                body = JSON.parse(rawBody);
            }

            if (body && body.linkedinData) {
                console.log("DEBUG: Payload = linkedinData");
                return await handleManualImport(body.linkedinData);
            }
            if (body && body.type === 'json_payload' && body.data) {
                console.log("DEBUG: Payload = Extension data. Name:", body.data.name);
                return await handleManualImport(body.data);
            }
        } catch (e) {
            console.error("DEBUG: Parse Error", e);
        }

        // Legacy scraper fallback removed for reliability
        return NextResponse.json(
            { error: "No valid payload received." },
            {
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );

    } catch (error: any) {
        console.error('LinkedIn Sync Error:', error.message, error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to sync LinkedIn data' },
            {
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}

import { enhanceContent } from '@/lib/gemini-enhancer';

async function handleManualImport(data: any) {

    // 1. Optimize "About" / "Hero"
    if (data.name) {
        console.log("DEBUG: Processing Hero for", data.name);
        let enhancedAbout = '';
        try {
            enhancedAbout = data.about ? await enhanceContent(data.about, 'about') : '';
        } catch (e) {
            console.log("DEBUG: AI About Enhancement failed, using raw About.");
            enhancedAbout = data.about || '';
        }

        const hero = await prisma.hero.findFirst({});

        if (hero) {
            console.log("DEBUG: Updating existing Hero...");
            await prisma.hero.update({
                where: { id: hero.id },
                data: {
                    title: data.headline || `Software Developer | ${data.location || ''}`,
                    // subtitle: data.location || '', // REMOVED: Field does not exist in schema
                    description: enhancedAbout || data.about || '',
                    ...(data.imageUrl && { imageUrl: data.imageUrl })
                }
            });
        } else {
            console.log("DEBUG: Creating NEW Hero...");
            await prisma.hero.create({
                data: {
                    name: data.name, // Fixed: Was missing
                    title: data.headline || `Software Developer | ${data.location || ''}`,
                    // subtitle: data.location || 'Remote', // REMOVED: Field does not exist in schema
                    description: enhancedAbout || data.about || '',
                    imageUrl: data.imageUrl || '/profile.png', // Default
                }
            });
        }

        // Also update the dedicated "About" model if it exists
        const aboutModel = await prisma.about.findFirst({});
        if (aboutModel) {
            await prisma.about.update({
                where: { id: aboutModel.id },
                data: {
                    heading: "About Me", // Ensure heading exists
                    subHeading: enhancedAbout || data.about || '', // Fixed: Mapped to subHeading
                }
            });
        } else {
            await prisma.about.create({
                data: {
                    heading: "About Me",
                    subHeading: enhancedAbout || data.about || '',
                }
            });
        }
    }

    // 2. Process Skills
    if (data.skills && Array.isArray(data.skills)) {
        // Flatten skills to string for AI optimization/categorization (optional)
        // Or just save them directly.
        // Let's pick top 20 and categorize?
        // For now, let's strictly replace the "Skill" table.

        await prisma.skill.deleteMany({});

        // We can pass the whole list to Gemini to get a "Top 15" curated list string
        const skillsString = data.skills.join(', ');
        let curatedSkills = [];
        try {
            // Attempt AI curation
            const curatedSkillsString = await enhanceContent(skillsString, 'skills');
            curatedSkills = curatedSkillsString.split(',').map(s => s.trim()).filter(s => s);
        } catch (e) {
            // Fallback to top 15 raw skills if AI fails
            console.log("DEBUG: AI Curation failed, using raw top 15.");
            curatedSkills = data.skills.slice(0, 15);
        }

        // Ensure "General" category exists
        const generalCategory = await prisma.skillCategory.upsert({
            where: { id: 'general-category' }, // Using a fixed ID for simplicity or query by title if strictly unique
            update: {},
            create: {
                id: 'general-category',
                title: 'General',
                icon: 'fas fa-code',
                order: 0
            }
        });

        // Use a simpler findFirst approach if the fixed ID isn't guaranteed or valid for your DB setup
        // But upsert with fixed ID is safest for a singleton "General" category.

        for (const skillName of curatedSkills) {
            await prisma.skill.create({
                data: {
                    name: skillName,
                    category: { connect: { id: generalCategory.id } }, // Fixed: Connect to relation
                    level: 5,
                    order: 0
                }
            });
        }
    }

    // 3. Update Experience
    if (data.experience && Array.isArray(data.experience)) {
        await prisma.experience.deleteMany({});
        for (const exp of data.experience) {
            // Optional: Enhance experience description too?
            // const enhancedDesc = await enhanceContent(exp.description, 'experience');

            await prisma.experience.create({
                data: {
                    position: exp.position || 'Unknown Role',
                    company: exp.company || 'Unknown Company',
                    duration: exp.duration || '',
                    description: exp.description || '', // Keeping original for accuracy, or use enhancedDesc
                    location: exp.location || '',
                    order: 0,
                }
            });
        }
    }

    // 4. Update Education
    if (data.education && Array.isArray(data.education)) {
        await prisma.education.deleteMany({});
        for (const edu of data.education) {
            await prisma.education.create({
                data: {
                    institution: edu.institution || 'Unknown',
                    degree: edu.degree || '',
                    level: '',
                    duration: edu.duration || '',
                    description: '',
                }
            })
        }
    }

    // 5. Update Certifications
    if (data.certifications && Array.isArray(data.certifications)) {
        await prisma.certification.deleteMany({});
        for (const cert of data.certifications) {
            await prisma.certification.create({
                data: {
                    title: cert.title || 'Unknown Certification',
                    organization: cert.organization || 'Unknown Organization',
                    date: cert.date || '',
                    description: '',
                    certificateUrl: cert.url || null,
                    imageUrl: cert.imageUrl || null,
                    tags: [],
                    isVisible: false, // Default hidden
                    order: 0,
                }
            });
        }
    }

    return NextResponse.json(
        { success: true, message: "Sync & AI Enhancement Complete" },
        {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        }
    );
}
