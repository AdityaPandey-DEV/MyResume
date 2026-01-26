import { prisma } from "../lib/prisma";

async function checkSkills() {
    console.log("🧐 Checking Database Content...");

    const advanced = await prisma.advancedSkill.findMany();
    console.log("Advanced Skills:", JSON.stringify(advanced, null, 2));

    const soft = await prisma.softSkill.findMany();
    console.log("Soft Skills:", JSON.stringify(soft, null, 2));
}

checkSkills();
