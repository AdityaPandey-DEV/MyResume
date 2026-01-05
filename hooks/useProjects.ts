import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get('/projects')
      return res.data
    },
  })
}

