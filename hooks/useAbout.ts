import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useAbout() {
  return useQuery({
    queryKey: ['about'],
    queryFn: async () => {
      const res = await axios.get('/about')
      return res.data
    },
  })
}

