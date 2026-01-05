export default function AdvancedSkills({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div>
      <h4 className="text-xl font-medium mb-4 text-gray-800">{title}</h4>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

