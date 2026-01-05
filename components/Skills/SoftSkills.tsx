export default function SoftSkills({
  skills,
}: {
  skills: Array<{ title: string; description?: string; desc?: string }>
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {skills.map((skill, i) => (
        <div key={i} className="p-4 rounded-lg bg-blue-50">
          <h4 className="font-medium text-gray-800 mb-1">{skill.title}</h4>
          <p className="text-gray-600 text-sm">
            {skill.description || skill.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

