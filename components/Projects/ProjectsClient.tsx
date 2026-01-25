'use client'

import ProjectsCard from './ProjectsCard'

function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

type Props = {
  projects: any[]
  featuredProjects: any[]
}

export default function ProjectsClient({
  projects = [],
  featuredProjects = [],
}: Props) {
  // Get featured project IDs
  const featuredProjectIds = new Set(
    featuredProjects.map((fp) => fp.projectId)
  )

  // Filter out featured projects
  const regularProjects = projects.filter(
    (project: any) => !featuredProjectIds.has(project.id)
  )

  if (regularProjects.length === 0) {
    return null
  }

  const projectsInRows = chunkArray(regularProjects, 3)

  return (
    <section id="projects" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center gradient-text">
          Projects
        </h2>

        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          Explore a selection of my work showcasing practical applications of my
          technical skills
        </p>

        <div className="mb-16 space-y-8">
          {projectsInRows.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {row.map((project: any) => (
                <ProjectsCard
                  key={project.id}
                  name={project.title}
                  description={project.description}
                  technologies={project.technologies}
                  icon={project.icon}
                  gradient={project.gradient}
                  imageUrl={project.imageUrl}
                  githubLink={project.githubUrl}
                  liveDemoLink={project.liveDemoUrl}
                  repoUrl={project.repoUrl}
                  syncEnabled={project.syncEnabled}
                  lastSyncedAt={project.lastSyncedAt ? new Date(project.lastSyncedAt) : undefined}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://github.com/adityapandey-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-bg text-white px-8 py-4 rounded-lg font-medium inline-flex items-center shadow-lg hover:shadow-xl transition duration-300"
          >
            <i className="fab fa-github mr-2"></i>
            <span>View All Projects on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  )
}