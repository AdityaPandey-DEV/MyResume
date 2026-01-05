import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { feature, order } = body

    if (!feature) {
      return NextResponse.json(
        { error: 'feature is required' },
        { status: 400 }
      )
    }

    // Get current max order
    const maxOrder = await prisma.keyFeature.findFirst({
      where: { featuredProjectId: id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const keyFeature = await prisma.keyFeature.create({
      data: {
        featuredProjectId: id,
        feature,
        order: order !== undefined ? order : (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(keyFeature, { status: 201 })
  } catch (error) {
    console.error('Error creating key feature:', error)
    return NextResponse.json(
      { error: 'Failed to create key feature' },
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
    const { keyFeatureId, order } = body

    if (keyFeatureId === undefined || order === undefined) {
      return NextResponse.json(
        { error: 'keyFeatureId and order are required' },
        { status: 400 }
      )
    }

    const updated = await prisma.keyFeature.update({
      where: { id: keyFeatureId },
      data: { order },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating key feature order:', error)
    return NextResponse.json(
      { error: 'Failed to update key feature order' },
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
    const { searchParams } = new URL(request.url)
    const keyFeatureId = searchParams.get('keyFeatureId')

    if (!keyFeatureId) {
      return NextResponse.json(
        { error: 'keyFeatureId query parameter is required' },
        { status: 400 }
      )
    }

    await prisma.keyFeature.delete({
      where: { id: keyFeatureId },
    })

    return NextResponse.json({ message: 'Key feature deleted successfully' })
  } catch (error) {
    console.error('Error deleting key feature:', error)
    return NextResponse.json(
      { error: 'Failed to delete key feature' },
      { status: 500 }
    )
  }
}

