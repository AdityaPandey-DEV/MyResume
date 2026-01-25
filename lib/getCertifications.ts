import { prisma } from '@/lib/prisma'

export async function getCertifications() {
  try {
    const certifications = await prisma.certification.findMany({
      orderBy: { order: 'asc' },
    })

    return certifications
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return []
  }
}