import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'

export interface KeyFeature {
  id: string
  featuredProjectId: string
  feature: string
  order: number
}

export interface FeaturedProject {
  id: string
  projectId: string
  imageUrl: string | null
  technologies: string[]
  project: {
    id: string
    title: string
    description: string
    technologies: string[]
    icon?: string | null
    gradient?: string | null
    githubUrl?: string | null
    liveDemoUrl?: string | null
  }
  keyFeatures: KeyFeature[]
}

export function useFeaturedProjects() {
  return useQuery<FeaturedProject[]>({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      try {
        const res = await axios.get('/featured-projects')
        return res.data || []
      } catch (error) {
        console.error('Error fetching featured projects:', error)
        throw error
      }
    },
  })
}

export function useFeaturedProject(id: string) {
  return useQuery<FeaturedProject>({
    queryKey: ['featured-projects', id],
    queryFn: async () => {
      const res = await axios.get(`/featured-projects/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateFeaturedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: {
      projectId: string
      imageUrl?: string
      technologies?: string[]
      keyFeatures?: string[]
    }) => {
      const res = await axios.post('/featured-projects', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateFeaturedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: {
        imageUrl?: string
        technologies?: string[]
        keyFeatures?: string[]
      }
    }) => {
      const res = await axios.put(`/featured-projects/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteFeaturedProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/featured-projects/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

