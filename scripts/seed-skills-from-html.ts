import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from "dotenv";
dotenv.config();
import { enhanceContent } from "../lib/gemini-enhancer";
import { prisma } from "../lib/prisma";

async function seedSkillsFromHtml() {
    console.log("🧩 Starting Smart Skills Restoration...");

    // 1. Read the HTML file
    const htmlPath = path.join(process.cwd(), 'temp-skills.html');
    if (!fs.existsSync(htmlPath)) {
        console.error("❌ HTML file not found!");
        return;
    }
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    console.log(`📄 Read ${htmlContent.length} bytes of HTML.`);

    // 2. Extract Data using AI
    console.log("🤖 Asking Groq AI to extract structured data...");
    const rawData = await enhanceContent(htmlContent, 'skills');

    let skillsData;
    try {
        skillsData = JSON.parse(rawData);
        console.log("✅ AI Extraction Successful!");
    } catch (e) {
        console.error("❌ Failed to parse AI response as JSON:", rawData);
        return;
    }

    // 3. Populate Database
    // Clear existing to avoid duplicates? Maybe safer to upsert.
    // Actually, user wants to restore, so let's clear for a clean slate if it matches the "Programming" etc categories.

    console.log("💾 Writing to Database...");

    // Iterate over categories
    for (const [categoryTitle, categoryData] of Object.entries(skillsData)) {
        if (categoryTitle === 'Soft Skills' || categoryTitle === 'Advanced') continue; // specialized handling if needed, but generic categories work too

        const catData = categoryData as any;
        const icon = catData.icon || 'fas fa-code';

        // Check if category exists
        let category = await prisma.skillCategory.findFirst({
            where: { title: categoryTitle }
        });

        if (category) {
            category = await prisma.skillCategory.update({
                where: { id: category.id },
                data: { icon: icon }
            });
        } else {
            category = await prisma.skillCategory.create({
                data: { title: categoryTitle, icon: icon, order: 0 }
            });
        }
        console.log(`   📂 Category: ${categoryTitle}`);

        if (catData.skills && Array.isArray(catData.skills)) {
            for (const skill of catData.skills) {
                // Check if skill exists
                let existingSkill = await prisma.skill.findFirst({
                    where: {
                        categoryId: category.id,
                        name: skill.name
                    }
                });

                if (existingSkill) {
                    await prisma.skill.update({
                        where: { id: existingSkill.id },
                        data: { level: skill.level || 0 }
                    });
                } else {
                    await prisma.skill.create({
                        data: {
                            name: skill.name,
                            level: skill.level || 0,
                            categoryId: category.id,
                            isActive: true
                        }
                    });
                }
                console.log(`      🔹 Skill: ${skill.name} (${skill.level}%)`);
            }
        }
    }

    console.log("✨ Restoration Complete! The Skills page should now match the original.");
}

seedSkillsFromHtml();
