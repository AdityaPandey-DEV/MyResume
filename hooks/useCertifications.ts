import { useQuery } from '@tanstack/react-query'
import axios from '@/lib/axios'

export function useCertifications() {
  return useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const res = await axios.get('/certifications')
      return res.data
    },
  })
}

