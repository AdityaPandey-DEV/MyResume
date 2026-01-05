'use client'

import { useCertifications } from '@/hooks/useCertifications'
import Certificate from './Cirtificate/Cirtificate'

export default function Certifications() {
  const { data: certifications, isLoading } = useCertifications()

  if (isLoading) {
    return (
      <section id="certifications" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    )
  }

  if (!certifications || certifications.length === 0) {
    return null
  }

  return (
    <section id="certifications" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
          Certifications
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Professional certifications that validate my skills and commitment to
          continuous learning
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {certifications.map((cert: any) => (
            <Certificate
              key={cert.id}
              title={cert.title}
              icon={cert.icon || 'fas fa-certificate'}
              color={cert.color || 'blue'}
              description={cert.description}
              organization={cert.organization}
              date={cert.date}
              tags={cert.tags?.join(', ') || ''}
              certificateLink={cert.certificateUrl || '#'}
            />
          ))}
        </div>

        <div className="mt-12 text-center animate-fade-in delay-300">
          <a
            href="https://www.linkedin.com/in/adityapandey-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-lg"
          >
            <span>View All Certifications on LinkedIn</span>
            <i className="fab fa-linkedin ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  )
}

