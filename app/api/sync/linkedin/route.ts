
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

        let enhancedTitle = data.headline || '';
        let enhancedHeroDesc = data.about || '';
        let enhancedAboutSub = data.about || '';

        try {
            enhancedTitle = data.headline ? await enhanceContent(data.headline, 'hero-title') : data.headline;
            enhancedHeroDesc = data.about ? await enhanceContent(data.about, 'hero-description') : '';
            enhancedAboutSub = data.about ? await enhanceContent(data.about, 'about') : '';
        } catch (e) {
            console.log("DEBUG: AI Enhancement failed, using raw data.");
        }

        const hero = await prisma.hero.findFirst({});

        if (hero) {
            console.log("DEBUG: Updating existing Hero...");
            await prisma.hero.update({
                where: { id: hero.id },
                data: {
                    title: enhancedTitle || data.headline || `Software Developer | ${data.location || ''}`,
                    description: enhancedHeroDesc || data.about?.substring(0, 150) || '',
                    ...(data.imageUrl && { imageUrl: data.imageUrl })
                }
            });
        } else {
            console.log("DEBUG: Creating NEW Hero...");
            await prisma.hero.create({
                data: {
                    name: data.name,
                    title: enhancedTitle || data.headline || `Software Developer | ${data.location || ''}`,
                    description: enhancedHeroDesc || data.about?.substring(0, 150) || '',
                    imageUrl: data.imageUrl || '/profile.png',
                }
            });
        }

        // Update About Section
        const aboutModel = await prisma.about.findFirst({
            include: { journey: true }
        });

        const aboutData = {
            heading: "About Me",
            subHeading: "Passionate developer with a focus on creating impactful solutions and continuous learning"
        };

        let currentAbout;
        if (aboutModel) {
            currentAbout = await prisma.about.update({
                where: { id: aboutModel.id },
                data: aboutData
            });
        } else {
            currentAbout = await prisma.about.create({
                data: aboutData
            });
        }

        // Update Journey (3 paragraphs)
        const journeyParas = enhancedAboutSub.split('\n\n').filter((p: string) => p.trim());
        const journey = await prisma.journey.upsert({
            where: { aboutId: currentAbout.id },
            update: { title: "My Journey" },
            create: {
                aboutId: currentAbout.id,
                title: "My Journey"
            }
        });

        await prisma.journeyParagraph.deleteMany({ where: { journeyId: journey.id } });
        for (let i = 0; i < Math.min(journeyParas.length, 3); i++) {
            await prisma.journeyParagraph.create({
                data: {
                    journeyId: journey.id,
                    content: journeyParas[i],
                    order: i
                }
            });
        }

        // Add default Focus Areas if empty
        const countFocus = await prisma.focusArea.count({ where: { aboutId: currentAbout.id } });
        if (countFocus === 0) {
            const defaults = [
                { title: "Full Stack Web Development", description: "Creating responsive, intuitive interfaces and robust backend systems.", icon: "desktop" },
                { title: "AI & Machine Learning", description: "Exploring artificial intelligence and machine learning applications.", icon: "brain" },
                { title: "Competitive Programming", description: "Sharpening problem-solving skills through algorithmic challenges.", icon: "code" }
            ];
            for (let i = 0; i < defaults.length; i++) {
                await prisma.focusArea.create({
                    data: {
                        aboutId: currentAbout.id,
                        title: defaults[i].title,
                        description: defaults[i].description,
                        icon: defaults[i].icon,
                        order: i
                    }
                });
            }
        }

        // Add default Personal Values if empty
        const countValues = await prisma.personalValue.count({ where: { aboutId: currentAbout.id } });
        if (countValues === 0) {
            const defaultValues = ["Curiosity", "Innovation", "Problem Solving", "Adaptability", "Continuous Learning"];
            for (let i = 0; i < defaultValues.length; i++) {
                await prisma.personalValue.create({
                    data: {
                        aboutId: currentAbout.id,
                        value: defaultValues[i],
                        order: i
                    }
                });
            }
        }
    }

    // 2. Process Skills (Categorized)
    if (data.skills && Array.isArray(data.skills)) {
        await prisma.skill.deleteMany({});
        const skillsString = data.skills.join(', ');

        let categorizedSkills: Record<string, string[]> = {
            "Programming": [],
            "Frontend": [],
            "Backend": [],
            "Tools & DevOps": []
        };

        try {
            const aiResponse = await enhanceContent(skillsString, 'skills');
            const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            categorizedSkills = JSON.parse(jsonStr);
        } catch (e) {
            console.log("DEBUG: AI Categorization failed, using default grouping.");
            categorizedSkills["Programming"] = data.skills.slice(0, 5);
        }

        const categoryIcons: Record<string, string> = {
            "Programming": "fas fa-code",
            "Frontend": "fas fa-laptop-code",
            "Backend": "fas fa-server",
            "Tools & DevOps": "fas fa-tools"
        };

        for (const [title, skills] of Object.entries(categorizedSkills)) {
            const category = await prisma.skillCategory.upsert({
                where: { id: title.toLowerCase().replace(/\s+/g, '-') },
                update: { title },
                create: {
                    id: title.toLowerCase().replace(/\s+/g, '-'),
                    title,
                    icon: categoryIcons[title] || "fas fa-code",
                    order: 0
                }
            });

            for (const skillName of skills as string[]) {
                await prisma.skill.create({
                    data: {
                        name: skillName,
                        level: 85,
                        category: { connect: { id: category.id } },
                        order: 0
                    }
                });
            }
        }
    }

    // 3. Update Experience
    if (data.experience && Array.isArray(data.experience)) {
        await prisma.experience.deleteMany({});
        for (const exp of data.experience) {
            let enhancedDesc = exp.description || '';
            try {
                if (exp.description) {
                    enhancedDesc = await enhanceContent(exp.description, 'experience');
                }
            } catch (e) {
                console.warn("DEBUG: Experience AI enhancement failed.");
            }

            await prisma.experience.create({
                data: {
                    position: exp.position || 'Unknown Role',
                    company: exp.company || 'Unknown Company',
                    duration: exp.duration || '',
                    description: enhancedDesc,
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
                    isVisible: false,
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
