import { prisma } from '@/lib/prisma'

export async function getHero() {
  try {
    const hero = await prisma.hero.findFirst()
    return hero
  } catch (error) {
    console.error('Error fetching hero:', error)
    return null
  }
}