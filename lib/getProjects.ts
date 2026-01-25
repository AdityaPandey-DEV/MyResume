import { prisma } from '@/lib/prisma'

export async function getProjects() {
  try {
    // Direct DB access is better for Server Components than self-fetching
    const projects = await prisma.project.findMany({
      where: { isVisible: true }, // Only show active projects by default on public facing calls
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
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}