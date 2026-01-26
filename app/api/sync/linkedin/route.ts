
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeLinkedInProfile } from '@/lib/linkedin-scraper';
import { revalidatePath } from 'next/cache';
import { getScreenshotUrl } from '@/lib/meta-helper';


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
            console.log("DEBUG: AI Enhancement failed, using truncated raw data.");
            enhancedHeroDesc = data.about?.substring(0, 160) + '...' || '';
            enhancedAboutSub = data.about || '';
        }

        const hero = await prisma.hero.findFirst({});

        if (hero) {
            console.log("DEBUG: Updating existing Hero...");
            await prisma.hero.update({
                where: { id: hero.id },
                data: {
                    title: enhancedTitle || data.headline || `Software Developer | ${data.location || ''}`,
                    description: enhancedHeroDesc || '',
                    ...(data.imageUrl && { imageUrl: data.imageUrl })
                }
            });
        } else {
            console.log("DEBUG: Creating NEW Hero...");
            await prisma.hero.create({
                data: {
                    name: data.name,
                    title: enhancedTitle || data.headline || `Software Developer | ${data.location || ''}`,
                    description: enhancedHeroDesc || '',
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
                { title: "Competitive Programming", description: "Sharpening problem-solving skills through algorithmic challenges.", icon: "code" },
                { title: "Cloud Computing", description: "Building scalable and reliable applications using cloud services.", icon: "cloud" }
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
        await prisma.skillCategory.deleteMany({}); // Clear categories to remove empty ones
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
            "Programming": "fa-code",
            "Frontend": "fa-laptop-code",
            "Backend": "fa-server",
            "Tools & DevOps": "fa-tools"
        };

        for (const [title, skills] of Object.entries(categorizedSkills)) {
            if ((skills as string[]).length === 0) continue; // Skip empty categories

            const category = await prisma.skillCategory.create({
                data: {
                    id: title.toLowerCase().replace(/\s+/g, '-'),
                    title,
                    icon: categoryIcons[title] || "fa-code",
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

    // 3b. Process Advanced & Soft Skills (New)
    // We can infer some advanced skills from the existing data
    if (data.skills && Array.isArray(data.skills)) {
        await prisma.advancedSkill.deleteMany({});
        await prisma.softSkill.deleteMany({});

        // In a real scenario, we'd use Gemini to categorize these too.
        // For now, let's provide smart defaults based on common dev profiles
        const aiRelated = data.skills.filter((s: string) => /ai|ml|learning|data|gpt|vision/i.test(s));
        const cloudRelated = data.skills.filter((s: string) => /cloud|aws|azure|gcp|docker|kubernetes|vercel/i.test(s));
        const softRelated = ["Problem Solving", "Team Leadership", "Communication", "Adaptability"];

        for (const skill of aiRelated.slice(0, 4)) {
            await prisma.advancedSkill.create({ data: { category: 'ai', skill } });
        }
        for (const skill of cloudRelated.slice(0, 4)) {
            await prisma.advancedSkill.create({ data: { category: 'cloud', skill } });
        }
        for (const skill of softRelated) {
            await prisma.softSkill.create({
                data: {
                    title: skill,
                    description: `Demonstrated expertise in ${skill.toLowerCase()} through various projects and collaborations.`
                }
            });
        }
    }
    // 4. Update Education
    if (data.education && Array.isArray(data.education)) {
        await prisma.education.deleteMany({});

        // Match the 3-tier style from HTML (Blue, Indigo, Purple)
        const styles = [
            { bg: "bg-blue-600", light: "text-blue-100", pill: "bg-blue-50", pillText: "text-blue-600", icon: "fa-graduation-cap" },
            { bg: "bg-indigo-600", light: "text-indigo-100", pill: "bg-indigo-50", pillText: "text-indigo-600", icon: "fa-school" },
            { bg: "bg-purple-600", light: "text-purple-100", pill: "bg-purple-50", pillText: "text-purple-600", icon: "fa-book" }
        ];

        for (let i = 0; i < data.education.length; i++) {
            const edu = data.education[i];
            const style = styles[i] || styles[0]; // Fallback to first style

            await prisma.education.create({
                data: {
                    institution: edu.institution || 'Unknown',
                    degree: edu.degree || '',
                    level: i === 0 ? "B.Tech" : i === 1 ? "Senior Secondary" : "Secondary",
                    duration: edu.duration || '',
                    description: edu.description || '',
                    bgColor: style.bg,
                    lightText: style.light,
                    pillBg: style.pill,
                    pillText: style.pillText,
                    icon: style.icon,
                    order: i
                }
            })
        }
    }

    // 5. Update Certifications
    if (data.certifications && Array.isArray(data.certifications)) {
        await prisma.certification.deleteMany({});

        const vibrantColors = ['blue', 'indigo', 'purple', 'pink', 'rose', 'orange', 'emerald', 'cyan'];
        const iconMap: Record<string, string> = {
            'ai': 'fa-brain',
            'machine learning': 'fa-brain',
            'python': 'fa-brands fa-python',
            'javascript': 'fa-brands fa-js',
            'react': 'fa-brands fa-react',
            'google': 'fa-brands fa-google',
            'cloud': 'fa-cloud',
            'security': 'fa-shield-halved',
            'hacking': 'fa-user-secret',
            'english': 'fa-language',
            'communication': 'fa-comments',
            'development': 'fa-code',
            'frontend': 'fa-laptop-code',
            'backend': 'fa-server',
            'full stack': 'fa-layer-group',
            'meta': 'fa-meta', // custom handling
            'ibm': 'fa-building',
        };

        for (let i = 0; i < data.certifications.length; i++) {
            const cert = data.certifications[i];
            const titleLower = cert.title?.toLowerCase() || '';
            const orgLower = cert.organization?.toLowerCase() || '';

            // Pick color based on index for variety
            const color = vibrantColors[i % vibrantColors.length];

            // Resolve Image (Priority: Media Image > Screenshot of Link > Logo)
            let finalImageUrl = cert.imageUrl || null;
            let finalLogoUrl = cert.logoUrl || null;

            // If we only have the logo, or no image at all, try to get a screenshot of the certificate URL
            if ((!finalImageUrl || finalImageUrl === finalLogoUrl) && cert.url) {
                // Use a screenshot service for the actual certificate preview
                finalImageUrl = getScreenshotUrl(cert.url);
            }

            // Find best matching icon
            let icon = 'fa-certificate';
            for (const [key, value] of Object.entries(iconMap)) {
                if (titleLower.includes(key) || orgLower.includes(key)) {
                    icon = value;
                    break;
                }
            }
            if (orgLower.includes('google')) icon = 'fa-brands fa-google';
            if (orgLower.includes('meta')) icon = 'fa-brands fa-facebook-f';
            if (orgLower.includes('ibm')) icon = 'fa-id-card';

            await prisma.certification.create({
                data: {
                    title: cert.title || 'Unknown Certification',
                    organization: cert.organization || 'Unknown Organization',
                    date: cert.date || '',
                    description: cert.description || '',
                    certificateUrl: cert.url || null,
                    imageUrl: finalImageUrl,
                    logoUrl: finalLogoUrl,
                    tags: cert.tags || [],
                    icon: icon,
                    color: color,
                    isVisible: true,
                    order: i,
                }
            });
        }
    }

    revalidatePath('/');
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
