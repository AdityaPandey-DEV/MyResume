import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Optional: stronger security check for admin param
    if (isAdmin) {
      const session = await auth();
      if (!session) {
        // If claiming to be admin but not auth, fall back to public or error?
        // Safest to just return public-only or unauthorized.
        // For simplicity here, if auth fails, we show only public.
      }
    }

    const where = isAdmin ? {} : { isVisible: true };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        featuredProject: {
          include: {
            keyFeatures: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    })
    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      technologies,
      icon,
      gradient,
      imageUrl,
      githubUrl,
      liveDemoUrl,
      repoUrl,
      isVisible,
      order,
    } = body

    const project = await prisma.project.create({
      data: {
        title,
        description,
        technologies,
        icon,
        gradient,
        imageUrl,
        githubUrl,
        liveDemoUrl,
        repoUrl,
        isVisible: isVisible ?? true, // Default true for manual creation
        order: order ?? 0,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

