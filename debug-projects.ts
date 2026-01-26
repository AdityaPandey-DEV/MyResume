
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const projects = await prisma.project.findMany()
    console.log("Total Projects:", projects.length)
    console.log("Projects found:")
    projects.forEach(p => {
        console.log(`- Title: ${p.title}, Visible: ${p.isVisible}, Desc: ${p.description?.substring(0, 50)}...`)
    })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
