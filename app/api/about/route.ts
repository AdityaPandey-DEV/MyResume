import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const about = await prisma.about.findFirst({
      include: {
        journey: {
          include: {
            paragraphs: {
              orderBy: { order: 'asc' },
            },
          },
        },
        values: {
          orderBy: { order: 'asc' },
        },
        focusAreas: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!about) {
      return NextResponse.json({ error: 'About data not found' }, { status: 404 })
    }

    return NextResponse.json(about)
  } catch (error) {
    console.error('Error fetching about:', error)
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { heading, subHeading, journey, values, focusAreas } = body

    // Get or create about
    let about = await prisma.about.findFirst()

    if (!about) {
      about = await prisma.about.create({
        data: {
          heading,
          subHeading,
        },
      })
    } else {
      about = await prisma.about.update({
        where: { id: about.id },
        data: {
          heading,
          subHeading,
        },
      })
    }

    // Update journey
    if (journey) {
      const existingJourney = await prisma.journey.findUnique({
        where: { aboutId: about.id },
      })

      if (existingJourney) {
        // Delete old paragraphs
        await prisma.journeyParagraph.deleteMany({
          where: { journeyId: existingJourney.id },
        })

        // Update journey
        await prisma.journey.update({
          where: { id: existingJourney.id },
          data: {
            title: journey.title,
            paragraphs: {
              create: journey.paragraphs.map((p: string, index: number) => ({
                content: p,
                order: index,
              })),
            },
          },
        })
      } else {
        await prisma.journey.create({
          data: {
            aboutId: about.id,
            title: journey.title,
            paragraphs: {
              create: journey.paragraphs.map((p: string, index: number) => ({
                content: p,
                order: index,
              })),
            },
          },
        })
      }
    }

    // Update values
    if (values) {
      await prisma.personalValue.deleteMany({
        where: { aboutId: about.id },
      })
      await prisma.personalValue.createMany({
        data: values.map((v: string, index: number) => ({
          aboutId: about.id,
          value: v,
          order: index,
        })),
      })
    }

    // Update focus areas
    if (focusAreas) {
      await prisma.focusArea.deleteMany({
        where: { aboutId: about.id },
      })
      await prisma.focusArea.createMany({
        data: focusAreas.map((fa: any, index: number) => ({
          aboutId: about.id,
          title: fa.title,
          description: fa.description,
          icon: fa.icon,
          order: index,
        })),
      })
    }

    // Fetch updated about
    const updatedAbout = await prisma.about.findUnique({
      where: { id: about.id },
      include: {
        journey: {
          include: {
            paragraphs: {
              orderBy: { order: 'asc' },
            },
          },
        },
        values: {
          orderBy: { order: 'asc' },
        },
        focusAreas: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedAbout)
  } catch (error) {
    console.error('Error updating about:', error)
    return NextResponse.json(
      { error: 'Failed to update about data' },
      { status: 500 }
    )
  }
}

