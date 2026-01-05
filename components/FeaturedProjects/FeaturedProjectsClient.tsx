'use client'

import FeaturedProjectSpotlight from './FeaturedProjectSpotlight'

type Props = {
  featuredProjects: any[]
}

export default function FeaturedProjectsClient({
  featuredProjects = [],
}: Props) {
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
          {featuredProjects.map((featuredProject: any) => (
            <FeaturedProjectSpotlight
              key={featuredProject.id}
              featuredProject={featuredProject}
            />
          ))}
        </div>
      </div>
    </section>
  )
}