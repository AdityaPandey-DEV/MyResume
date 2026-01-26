import SkillBar from './SkillBar'
import SkillTags from './SkillTags'

export default function SkillCard({
  title,
  icon,
  skills,
  tags,
}: {
  title: string
  icon?: string
  skills: Array<{ name: string; level: number }>
  tags: string[]
}) {
  const activeSkills = skills.filter((s) => s.level > 0)
  const zeroLevelSkills = skills
    .filter((s) => s.level === 0)
    .map((s) => s.name)

  const allTags = [...(tags || []), ...zeroLevelSkills]

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-center mb-5">
        <div className="bg-blue-100 p-3 rounded-lg mr-4">
          {icon && <i className={`${icon} text-blue-600 text-xl`} />}
        </div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>

      <div className="space-y-3">
        {activeSkills.map((skill, i) => (
          <SkillBar key={i} name={skill.name} level={skill.level} />
        ))}
        {allTags.length > 0 && <SkillTags tags={allTags} />}
      </div>
    </div>
  )
}

