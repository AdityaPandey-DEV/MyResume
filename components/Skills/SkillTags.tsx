export default function SkillTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm font-medium"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

