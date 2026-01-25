import { prisma } from '@/lib/prisma'

export async function getSkills() {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
    })

    const advancedSkills = await prisma.advancedSkill.findMany({
      orderBy: { order: 'asc' },
    })

    const softSkills = await prisma.softSkill.findMany({
      orderBy: { order: 'asc' },
    })

    return {
      categories,
      advancedSkills,
      softSkills,
    }
  } catch (error) {
    console.error('Error fetching skills:', error)
    return null
  }
}