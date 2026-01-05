import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const education = await prisma.education.findMany({
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(education)
  } catch (error) {
    console.error('Error fetching education:', error)
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      level,
      duration,
      degree,
      institution,
      description,
      icon,
      bgColor,
      lightText,
      pillBg,
      pillText,
      skills,
      order,
    } = body

    const education = await prisma.education.create({
      data: {
        level,
        duration,
        degree,
        institution,
        description,
        icon,
        bgColor,
        lightText,
        pillBg,
        pillText,
        skills,
        order: order ?? 0,
      },
    })

    return NextResponse.json(education, { status: 201 })
  } catch (error) {
    console.error('Error creating education:', error)
    return NextResponse.json(
      { error: 'Failed to create education' },
      { status: 500 }
    )
  }
}

