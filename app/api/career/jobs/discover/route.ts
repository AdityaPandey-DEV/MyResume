import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enhanceContent } from '@/lib/gemini-enhancer';

export async function POST(req: Request) {
  try {
    // 1. Get Persona Context
    const analysis = await prisma.userAnalysis.findFirst();
    const hero = await prisma.hero.findFirst();

    if (!analysis) return NextResponse.json({ success: false, error: 'Run Career Advisor first' }, { status: 400 });

    const context = {
      persona: analysis.holisticPersona,
      strengths: analysis.strengths,
      techStack: analysis.topTechStack,
      userTitle: hero?.title
    };

    // 2. Generate "Smart Search" Links (Deterministic & Reliable)
    // Instead of hallucinating specific broken links, we generate live search queries.

    const role = hero?.title || analysis.holisticPersona.split(' ')[0] || "Software Engineer";
    const mainSkill = analysis.topTechStack[0] || "React";
    const query = encodeURIComponent(`${role} ${mainSkill}`);
    const location = "India"; // Defaulting to India as implied by "Unstop/Internshala" request, or could be global.

    const discoveredJobs = [
      {
        company: "Unstop",
        role: `Latest ${role} Openings`,
        location: "India / Remote",
        jobUrl: `https://unstop.com/jobs?keywords=${query}`,
        whySuited: `Live search for ${role} roles on Unstop.`
      },
      {
        company: "Internshala",
        role: `${role} Internships`,
        location: "Remote / India",
        jobUrl: `https://internshala.com/internships/keywords-${encodeURIComponent(role)}`,
        whySuited: "Direct link to tailored internships matching your profile."
      },
      {
        company: "LinkedIn",
        role: "Targeted Network Search",
        location: "Global",
        jobUrl: `https://www.linkedin.com/jobs/search/?keywords=${query}`,
        whySuited: "Broad search across your professional network."
      },
      {
        company: "Google Careers",
        role: "Engineering Roles",
        location: "Bangalore / Hyderabad",
        jobUrl: `https://www.google.com/about/careers/applications/jobs/results?q=${encodeURIComponent(mainSkill)}`,
        whySuited: `Opportunities at Google matching your ${mainSkill} expertise.`
      },
      {
        company: "Microsoft Careers",
        role: "Tech Opportunities",
        location: "India",
        jobUrl: `https://careers.microsoft.com/us/en/search-results?keywords=${encodeURIComponent(mainSkill)}`,
        whySuited: "Explore Microsoft roles that fit your stack."
      },
      {
        company: "Naukri",
        role: "Priority Applicants",
        location: "India",
        jobUrl: `https://www.naukri.com/mnj/keywords-${query}`,
        whySuited: "High-volume job listings for your exact title."
      }
    ];

    console.log("Generated Smart Search Links:", discoveredJobs);

    return NextResponse.json({ success: true, discoveredJobs });

  } catch (error: any) {
    console.error("Job Discovery Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
