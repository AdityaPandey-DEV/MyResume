'use client'

import { useState, useEffect } from 'react'
import { FeaturedProject } from '@/hooks/useFeaturedProjects'

interface FeaturedProjectSpotlightProps {
  featuredProject: FeaturedProject
}

export default function FeaturedProjectSpotlight({
  featuredProject,
}: FeaturedProjectSpotlightProps) {
  const { project, imageUrl, technologies, keyFeatures } = featuredProject
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    console.log('FeaturedProjectSpotlight rendering:', {
      projectTitle: project?.title,
      imageUrl,
      technologiesCount: technologies?.length,
      keyFeaturesCount: keyFeatures?.length,
    })
  }, [project, imageUrl, technologies, keyFeatures])

  if (!project) {
    console.error('FeaturedProjectSpotlight: project is missing')
    return null
  }

  const fallbackImageUrl =
    'https://via.placeholder.com/600x400/3b82f6/FFFFFF?text=' +
    encodeURIComponent(`${project.title} Screenshot`)

  return (
    <div className="bg-blue-50 rounded-xl p-8 mb-8 animate-fade-in delay-600">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Project Spotlight: {project.title}
      </h3>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <div className="bg-white p-4 rounded-lg shadow-md">
            {imageUrl ? (
              <img
                src={imageError ? fallbackImageUrl : imageUrl}
                alt={`${project.title} Screenshot`}
                className="w-full h-auto rounded-lg shadow-sm"
                onError={() => {
                  if (!imageError) {
                    setImageError(true)
                  }
                }}
                width={600}
                height={400}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <h4 className="text-xl font-semibold mb-3 text-gray-800">
              Project Overview
            </h4>
            <p className="text-gray-600 mb-4">{project.description}</p>

            {keyFeatures && keyFeatures.length > 0 && (
              <>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  Key Features
                </h4>
                <ul className="space-y-2 mb-4 pl-5 list-disc text-gray-600">
                  {keyFeatures.map((keyFeature) => (
                    <li key={keyFeature.id}>{keyFeature.feature}</li>
                  ))}
                </ul>
              </>
            )}

            {technologies && technologies.length > 0 && (
              <>
                <h4 className="text-xl font-semibold mb-3 text-gray-800">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex gap-4">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition duration-300 inline-flex items-center"
              >
                <i className="fab fa-github mr-2"></i>
                <span>GitHub Repository</span>
              </a>
            )}
            {project.liveDemoUrl && (
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-medium transition duration-300 inline-flex items-center"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                <span>View Live</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

