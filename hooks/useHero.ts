import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useHero() {
  return useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const res = await axios.get('/hero')
      return res.data
    },
  })
}

