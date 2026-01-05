import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await axios.get('/skills')
      return res.data
    },
  })
}

