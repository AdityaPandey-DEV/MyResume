import { getProjects } from '@/lib/getProjects'
import { getFeaturedProjects } from '@/lib/getFeaturedProjects'
import ProjectsClient from './ProjectsClient'

export default async function Projects() {
  const [projects, featuredProjects] = await Promise.all([
    getProjects(),
    getFeaturedProjects(),
  ])

  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <ProjectsClient
      projects={projects}
      featuredProjects={featuredProjects ?? []}
    />
  )
}