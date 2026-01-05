import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const education = await prisma.education.findUnique({
      where: { id },
    })

    if (!education) {
      return NextResponse.json(
        { error: 'Education not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error fetching education:', error)
    return NextResponse.json(
      { error: 'Failed to fetch education' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const education = await prisma.education.update({
      where: { id },
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
        order,
      },
    })

    return NextResponse.json(education)
  } catch (error) {
    console.error('Error updating education:', error)
    return NextResponse.json(
      { error: 'Failed to update education' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.education.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Education deleted successfully' })
  } catch (error) {
    console.error('Error deleting education:', error)
    return NextResponse.json(
      { error: 'Failed to delete education' },
      { status: 500 }
    )
  }
}

