import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const featuredProject = await prisma.featuredProject.findUnique({
      where: { id },
      include: {
        project: true,
        keyFeatures: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!featuredProject) {
      return NextResponse.json(
        { error: 'Featured project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(featuredProject)
  } catch (error) {
    console.error('Error fetching featured project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { imageUrl, technologies, keyFeatures } = body

    // If keyFeatures are provided, we need to replace them
    if (keyFeatures !== undefined) {
      // Delete existing key features
      await prisma.keyFeature.deleteMany({
        where: { featuredProjectId: id },
      })

      // Create new key features
      const updated = await prisma.featuredProject.update({
        where: { id },
        data: {
          imageUrl: imageUrl !== undefined ? imageUrl : undefined,
          technologies: technologies !== undefined ? technologies : undefined,
          keyFeatures: {
            create: keyFeatures.map((feature: string, index: number) => ({
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

      return NextResponse.json(updated)
    } else {
      // Just update imageUrl and/or technologies
      const updated = await prisma.featuredProject.update({
        where: { id },
        data: {
          ...(imageUrl !== undefined && { imageUrl }),
          ...(technologies !== undefined && { technologies }),
        },
        include: {
          project: true,
          keyFeatures: {
            orderBy: { order: 'asc' },
          },
        },
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error('Error updating featured project:', error)
    return NextResponse.json(
      { error: 'Failed to update featured project' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.featuredProject.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Featured project deleted successfully' })
  } catch (error) {
    console.error('Error deleting featured project:', error)
    return NextResponse.json(
      { error: 'Failed to delete featured project' },
      { status: 500 }
    )
  }
}

