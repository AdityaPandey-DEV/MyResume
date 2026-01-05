import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const certifications = await prisma.certification.findMany({
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

    return NextResponse.json(certification, { status: 201 })
  } catch (error) {
    console.error('Error creating certification:', error)
    return NextResponse.json(
      { error: 'Failed to create certification' },
      { status: 500 }
    )
  }
}

