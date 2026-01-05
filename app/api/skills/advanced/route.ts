import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const advancedSkills = await prisma.advancedSkill.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(advancedSkills)
  } catch (error) {
    console.error('Error fetching advanced skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch advanced skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, skill, order } = body

    if (!category || !skill) {
      return NextResponse.json(
        { error: 'Category and skill are required' },
        { status: 400 }
      )
    }

    if (category !== 'ai' && category !== 'cloud') {
      return NextResponse.json(
        { error: 'Category must be "ai" or "cloud"' },
        { status: 400 }
      )
    }

    const advancedSkill = await prisma.advancedSkill.create({
      data: {
        category,
        skill,
        order: order ?? 0,
      },
    })

    return NextResponse.json(advancedSkill, { status: 201 })
  } catch (error) {
    console.error('Error creating advanced skill:', error)
    return NextResponse.json(
      { error: 'Failed to create advanced skill' },
      { status: 500 }
    )
  }
}

