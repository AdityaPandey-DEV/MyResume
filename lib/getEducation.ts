import { prisma } from '@/lib/prisma'

export async function getEducation() {
  try {
    const education = await prisma.education.findMany({
      orderBy: { order: 'asc' },
    })

    return education
  } catch (error) {
    console.error('Error fetching education:', error)
    return []
  }
}