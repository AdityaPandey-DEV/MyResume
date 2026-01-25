import { prisma } from '@/lib/prisma'

export async function getFeaturedProjects() {
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
    return featuredProjects
  } catch (error) {
    console.error('Error fetching featured projects:', error)
    return []
  }
}