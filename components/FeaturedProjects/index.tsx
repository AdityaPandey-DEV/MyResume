import { getFeaturedProjects } from '@/lib/getFeaturedProjects'
import FeaturedProjectsClient from './FeaturedProjectsClient'

export default async function FeaturedProjects() {
  const featuredProjects = await getFeaturedProjects()

  if (!featuredProjects || featuredProjects.length === 0) {
    return null
  }

  return (
    <FeaturedProjectsClient featuredProjects={featuredProjects} />
  )
}