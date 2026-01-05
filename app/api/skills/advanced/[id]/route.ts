import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { category, skill, order } = body

    if (category && category !== 'ai' && category !== 'cloud') {
      return NextResponse.json(
        { error: 'Category must be "ai" or "cloud"' },
        { status: 400 }
      )
    }

    const advancedSkill = await prisma.advancedSkill.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(skill !== undefined && { skill }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(advancedSkill)
  } catch (error) {
    console.error('Error updating advanced skill:', error)
    return NextResponse.json(
      { error: 'Failed to update advanced skill' },
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
    await prisma.advancedSkill.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Advanced skill deleted successfully' })
  } catch (error) {
    console.error('Error deleting advanced skill:', error)
    return NextResponse.json(
      { error: 'Failed to delete advanced skill' },
      { status: 500 }
    )
  }
}

