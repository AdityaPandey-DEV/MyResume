import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const hero = await prisma.hero.findFirst()
    if (!hero) {
      return NextResponse.json({ error: 'Hero data not found' }, { status: 404 })
    }
    return NextResponse.json(hero)
  } catch (error) {
    console.error('Error fetching hero:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, title, description, imageUrl, linkedinUrl, githubUrl, email, leetcodeUrl } = body

    // Check if hero exists
    const existing = await prisma.hero.findFirst()

    const hero = existing
      ? await prisma.hero.update({
        where: { id: existing.id },
        data: {
          name,
          title,
          description,
          imageUrl,
          linkedinUrl,
          githubUrl,
          email,
          leetcodeUrl,
        },
      })
      : await prisma.hero.create({
        data: {
          name,
          title,
          description,
          imageUrl,
          linkedinUrl,
          githubUrl,
          email,
          leetcodeUrl,
        },
      })

    return NextResponse.json(hero)
  } catch (error) {
    console.error('Error updating hero:', error)
    return NextResponse.json(
      { error: 'Failed to update hero data' },
      { status: 500 }
    )
  }
}

