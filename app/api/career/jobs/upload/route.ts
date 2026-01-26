import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

        // 1. Storage
        let resumeUrl = ''
        const timestamp = Date.now()
        const fileName = `${timestamp}-${file.name.replace(/\s/g, '_')}`

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const blob = await put(`resumes/${fileName}`, file, { access: 'public' })
            resumeUrl = blob.url
        } else {
            const uploadDir = join(process.cwd(), 'public', 'resumes')
            if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)
            await writeFile(join(uploadDir, fileName), buffer)
            resumeUrl = `/resumes/${fileName}`
        }

        // 2. Update Job Hunter Profile
        let profile = await prisma.jobHunterProfile.findFirst()
        if (profile) {
            profile = await prisma.jobHunterProfile.update({
                where: { id: profile.id },
                data: { resumeUrl }
            })
        } else {
            profile = await prisma.jobHunterProfile.create({
                data: { resumeUrl }
            })
        }

        return NextResponse.json({ success: true, profile })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
