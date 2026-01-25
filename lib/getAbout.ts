import { prisma } from '@/lib/prisma'

export async function getAbout() {
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
    return about
  } catch (error) {
    console.error('Error fetching about:', error)
    return null
  }
}