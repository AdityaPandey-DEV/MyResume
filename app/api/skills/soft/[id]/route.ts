import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, order } = body

    const softSkill = await prisma.softSkill.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(softSkill)
  } catch (error) {
    console.error('Error updating soft skill:', error)
    return NextResponse.json(
      { error: 'Failed to update soft skill' },
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
    await prisma.softSkill.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Soft skill deleted successfully' })
  } catch (error) {
    console.error('Error deleting soft skill:', error)
    return NextResponse.json(
      { error: 'Failed to delete soft skill' },
      { status: 500 }
    )
  }
}

