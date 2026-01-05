import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const softSkills = await prisma.softSkill.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(softSkills)
  } catch (error) {
    console.error('Error fetching soft skills:', error)
    return NextResponse.json(
      { error: 'Failed to fetch soft skills' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, order } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const softSkill = await prisma.softSkill.create({
      data: {
        title,
        description,
        order: order ?? 0,
      },
    })

    return NextResponse.json(softSkill, { status: 201 })
  } catch (error) {
    console.error('Error creating soft skill:', error)
    return NextResponse.json(
      { error: 'Failed to create soft skill' },
      { status: 500 }
    )
  }
}

