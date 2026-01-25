import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const featuredProjects = await prisma.featuredProject.findMany({
      include: {
        project: true,
        keyFeatures: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(featuredProjects)
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, imageUrl, technologies, keyFeatures } = body

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if project is already featured
    const existing = await prisma.featuredProject.findUnique({
      where: { projectId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Project is already featured' },
        { status: 400 }
      )
    }

    const featuredProject = await prisma.featuredProject.create({
      data: {
        projectId,
        imageUrl: imageUrl || project.imageUrl || null,
        technologies: technologies || [],
        keyFeatures: {
          create: (keyFeatures || []).map((feature: string, index: number) => ({
            feature,
            order: index,
          })),
        },
      },
      include: {
        project: true,
        keyFeatures: {
          orderBy: { order: 'asc' },
        },
      },
    })
    revalidatePath('/')


    return NextResponse.json(featuredProject, { status: 201 })
  } catch (error) {
    console.error('Error creating featured project:', error)
    return NextResponse.json(
      { error: 'Failed to create featured project' },
      { status: 500 }
    )
  }
}

