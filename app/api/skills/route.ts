import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET() {
  try {
    const categories = await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        skills: {
          where: { isActive: true },
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

    return NextResponse.json({
      categories,
      advancedSkills,
      softSkills,
    })
  } catch (error) {
    console.error('Error fetching skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { categories, advancedSkills, softSkills } = body

    // Update categories
    if (categories) {
      // Delete all existing categories and their skills
      await prisma.skill.deleteMany({})
      await prisma.skillCategory.deleteMany({})

      // Create new categories
      for (const cat of categories) {
        const category = await prisma.skillCategory.create({
          data: {
            title: cat.title,
            icon: cat.icon,
            order: cat.order ?? 0,
            tags: cat.tags || [],
            skills: {
              create: cat.skills.map((skill: any) => ({
                name: skill.name,
                level: skill.level,
                order: skill.order ?? 0,
              })),
            },
          },
        })
      }
    }

    // Update advanced skills
    if (advancedSkills) {
      await prisma.advancedSkill.deleteMany({})
      const aiSkills = advancedSkills.ai || []
      const cloudSkills = advancedSkills.cloud || []

      await prisma.advancedSkill.createMany({
        data: [
          ...aiSkills.map((skill: string, index: number) => ({
            category: 'ai',
            skill,
            order: index,
          })),
          ...cloudSkills.map((skill: string, index: number) => ({
            category: 'cloud',
            skill,
            order: index,
          })),
        ],
      })
    }

    // Update soft skills
    if (softSkills) {
      await prisma.softSkill.deleteMany({})
      await prisma.softSkill.createMany({
        data: softSkills.map((ss: any, index: number) => ({
          title: ss.title,
          description: ss.desc || ss.description,
          order: index,
        })),
      })
    }

    // Fetch updated data
    const updatedCategories = await prisma.skillCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        skills: {
          orderBy: { order: 'asc' },
        },
      },
    })

    const updatedAdvancedSkills = await prisma.advancedSkill.findMany({
      orderBy: { order: 'asc' },
    })

    const updatedSoftSkills = await prisma.softSkill.findMany({
      orderBy: { order: 'asc' },
    })
    revalidatePath('/')
    revalidatePath('/skills')

    return NextResponse.json({
      categories: updatedCategories,
      advancedSkills: updatedAdvancedSkills,
      softSkills: updatedSoftSkills,
    })
  } catch (error) {
    console.error('Error updating skills:', error)
    return NextResponse.json(
      { error: 'Failed to update skills' },
      { status: 500 }
    )
  }
}

