function Skill({ item, theme }: { item: string; theme: any }) {
  return (
    <span
      className={`${theme.pillBg} ${theme.pillText} px-3 py-1 rounded-full text-sm font-medium`}
    >
      {item}
    </span>
  )
}

export default function EducationCard({
  level,
  duration,
  degree,
  institution,
  description,
  skills,
  icon,
  theme,
}: {
  level: string
  duration: string
  degree: string
  institution: string
  description: string
  skills: string[]
  icon?: string
  theme: {
    bg: string
    lightText: string
    pillBg: string
    pillText: string
  }
}) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in">
      <div className="md:flex">
        <div
          className={`md:w-1/3 ${theme.bg} text-white p-6 flex flex-col justify-center items-center`}
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
            {icon && (
              <i className={`fas ${icon} ${theme.pillText} text-2xl`}></i>
            )}
          </div>

          <h3 className="text-xl font-bold text-center">{level}</h3>
          <p className={`${theme.lightText} text-center`}>{duration}</p>
        </div>

        <div className="md:w-2/3 p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-800">{degree}</h3>

          <p className="text-gray-600 mb-4">
            <i className="fas fa-university mr-2"></i>
            {institution}
          </p>

          <p className="text-gray-700 mb-4">{description}</p>

          <div className="flex flex-wrap gap-2">
            {skills.map((item, index) => (
              <Skill key={index} item={item} theme={theme} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

