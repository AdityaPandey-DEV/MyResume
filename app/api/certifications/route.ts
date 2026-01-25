import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const isAdmin = searchParams.get('admin') === 'true'

    const certifications = await prisma.certification.findMany({
      where: isAdmin ? {} : { isVisible: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(certifications)
  } catch (error) {
    console.error('Error fetching certifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certifications' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      organization,
      date,
      tags,
      certificateUrl,
      icon,
      color,
      order,
    } = body

    const certification = await prisma.certification.create({
      data: {
        title,
        description,
        organization,
        date,
        tags,
        certificateUrl,
        icon,
        color,
        order: order ?? 0,
      },
    })
    revalidatePath('/')
    revalidatePath('/certifications')

    return NextResponse.json(certification, { status: 201 })
  } catch (error) {
    console.error('Error creating certification:', error)
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    )
  }
}
