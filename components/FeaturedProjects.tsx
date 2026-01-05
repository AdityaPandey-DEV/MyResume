'use client'

import { useEffect } from 'react'
import { useFeaturedProjects } from '@/hooks/useFeaturedProjects'
import FeaturedProjectSpotlight from './Project/FeaturedProjectSpotlight'

export default function FeaturedProjects() {
  const { data: featuredProjects, isLoading, error } = useFeaturedProjects()

  useEffect(() => {
    console.log('FeaturedProjects component mounted')
    console.log('Featured projects data:', featuredProjects)
    console.log('Is loading:', isLoading)
    console.log('Error:', error)
  }, [featuredProjects, isLoading, error])

  if (isLoading) {
    return (
      <section id="featured-projects" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center">Loading featured projects...</div>
        </div>
      </section>
    )
  }

  if (error) {
    console.error('Error loading featured projects:', error)
    return (
      <section id="featured-projects" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center text-red-600">
            Error loading featured projects. Please check the console.
          </div>
        </div>
      </section>
    )
  }

  if (!featuredProjects || featuredProjects.length === 0) {
    console.log('No featured projects found')
    return null
  }

  console.log('Rendering featured projects:', featuredProjects.length)

  return (
    <section id="featured-projects" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
          Featured Projects
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Explore a selection of my work showcasing practical applications of my
          technical skills
        </p>

        <div className="space-y-8">
          {featuredProjects.map((featuredProject) => {
            console.log('Rendering featured project:', featuredProject)
            return (
              <FeaturedProjectSpotlight
                key={featuredProject.id}
                featuredProject={featuredProject}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}

