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

    // 2. Generate Suited Jobs
    // We use a custom 'job-discovery' type (need to handle in enhancer or use suggestions)
    // I'll reuse 'career-suggestions' or a custom prompt for now
    const prompt = `Based on this Persona: ${JSON.stringify(context)}, 
        Discover 6 highly suitable job roles at specific companies that match this developer's level and stack.
        Target companies should range from high-growth startups to tech giants.
        
        Return strictly a JSON array of objects:
        [
          {
            "company": "Company Name",
            "role": "Specific Job Title",
            "location": "Preferred City or Remote",
            "jobUrl": "Search query URL for this job",
            "whySuited": "Brief reason why it matches their strengths (10 words)"
          }
        ]
        `;

    const discoveryRaw = await enhanceContent(prompt, 'career-suggestions');

    if (discoveryRaw === "API_QUOTA_EXCEEDED") {
      const demoJobs = [
        { company: "Vercel", role: "Software Engineer - Frontend", location: "Remote", jobUrl: "https://vercel.com/careers", whySuited: "Matches your React and Next.js expertise." },
        { company: "Google", role: "Full Stack Engineer", location: "Bangalore", jobUrl: "https://www.google.com/about/careers", whySuited: "Strong competitive programming rank (LeetCode/Codeforces)." },
        { company: "Razorpay", role: "Backend Developer (Node.js)", location: "Mumbai", jobUrl: "https://razorpay.com/jobs", whySuited: "Extensive experience with Prisma and PostgreSQL." }
      ];
      return NextResponse.json({ success: true, discoveredJobs: demoJobs, isDemo: true });
    }

    const discoveredJobs = JSON.parse(discoveryRaw);

    return NextResponse.json({ success: true, discoveredJobs });

  } catch (error: any) {
    console.error("Job Discovery Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
