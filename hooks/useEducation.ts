import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useEducation() {
  return useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const res = await axios.get('/education')
      return res.data
    },
  })
}

