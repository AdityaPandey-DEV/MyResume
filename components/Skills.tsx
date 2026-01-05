'use client'

import { useSkills } from '@/hooks/useSkills'
import SkillCard from './Skills/SkillCard'
import AdvancedSkills from './Skills/AdvancedSkills'
import SoftSkills from './Skills/SoftSkills'

export default function Skills() {
  const { data: skills, isLoading } = useSkills()

  if (isLoading) {
    return (
      <section id="skills" className="py-20 bg-pattern">
        <div className="container mx-auto px-6">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    )
  }

  if (!skills) {
    return null
  }

  const categories = skills.categories || []
  const advancedSkills = skills.advancedSkills || []
  const softSkills = skills.softSkills || []

  const aiSkills = advancedSkills
    .filter((s: any) => s.category === 'ai')
    .map((s: any) => s.skill)
  const cloudSkills = advancedSkills
    .filter((s: any) => s.category === 'cloud')
    .map((s: any) => s.skill)

  return (
    <section id="skills" className="py-20 bg-pattern">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center gradient-text">
          Skills & Technologies
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 my-16">
          {categories.map((category: any, i: number) => (
            <SkillCard
              key={i}
              title={category.title}
              icon={category.icon}
              skills={category.skills || []}
              tags={category.tags || []}
            />
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-16">
          <h3 className="text-2xl font-semibold mb-6 gradient-text">
            Advanced Technologies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AdvancedSkills title="AI & ML" items={aiSkills} />
            <AdvancedSkills title="Cloud & Other Technologies" items={cloudSkills} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-semibold mb-6 gradient-text">
            Soft Skills
          </h3>
          <SoftSkills skills={softSkills} />
        </div>
      </div>
    </section>
  )
}

