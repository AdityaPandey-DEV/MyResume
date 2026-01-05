'use client'

import { useAbout } from '@/hooks/useAbout'

function FocusCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start p-5 rounded-lg bg-gray-50 hover:bg-gray-100 transition duration-300">
      <div className="bg-blue-100 p-3 rounded-lg mr-4 text-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <div>
        <h4 className="text-xl font-medium mb-2 text-gray-800">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

export default function About() {
  const { data: about, isLoading } = useAbout()

  if (isLoading) {
    return (
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    )
  }

  if (!about) {
    return null
  }

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
          {about.heading}
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          {about.subHeading}
        </p>

        <div className="flex flex-col md:flex-row items-start gap-10">
          <div className="md:w-1/2 animate-fade-in">
            {about.journey && (
              <>
                <h3 className="text-2xl font-semibold mb-6 flex flex-row text-gray-800">
                  {about.journey.title}
                </h3>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {about.journey.paragraphs?.map((paragraph: any, index: number) => (
                    <p key={index}>{paragraph.content}</p>
                  ))}
                </div>
              </>
            )}

            {about.values && about.values.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xl font-semibold mb-4 text-gray-800">
                  Personal Values
                </h4>
                <div className="flex flex-wrap gap-3">
                  {about.values.map((value: any, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {value.value}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:w-1/2 animate-fade-in delay-200">
            {about.focusAreas && about.focusAreas.length > 0 && (
              <>
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                  My Focus Areas
                </h3>
                <div className="space-y-6">
                  {about.focusAreas.map((item: any, index: number) => (
                    <FocusCard
                      key={index}
                      title={item.title}
                      description={item.description}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

