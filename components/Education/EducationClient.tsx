'use client'

import EducationCard from './Card'

type Props = {
  education: any[]
}

export default function EducationClient({ education }: Props) {
  return (
    <section id="education" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
          Education
        </h2>

        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          My academic journey has provided me with a strong foundation in
          computer science and engineering
        </p>

        <div className="space-y-8 max-w-4xl mx-auto">
          {education.map((item: any, index: number) => (
            <EducationCard
              key={item.id || index}
              level={item.level}
              duration={item.duration}
              degree={item.degree}
              institution={item.institution}
              description={item.description}
              skills={item.skills || []}
              icon={item.icon}
              theme={{
                bg: item.bgColor || 'bg-blue-600',
                lightText: item.lightText || 'text-blue-100',
                pillBg: item.pillBg || 'bg-blue-50',
                pillText: item.pillText || 'text-blue-600',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}