export default function SkillBar({ name, level }: { name: string; level: number }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-medium text-gray-700">{name}</span>
        <span className="text-gray-500">{level}%</span>
      </div>
      <div className="skill-bar">
        <div className="skill-progress" style={{ width: `${level}%` }} />
      </div>
    </div>
  )
}

