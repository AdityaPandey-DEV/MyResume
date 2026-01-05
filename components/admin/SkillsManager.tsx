'use client'

import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

export default function SkillsManager() {
  const queryClient = useQueryClient()

  const { data: skills, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const res = await axios.get('/skills')
      return res.data
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axios.put('/skills', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Skills updated successfully!')
    },
    onError: () => {
      toast.error('Failed to update skills')
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      categories: skills?.categories || [],
      advancedSkills: {
        ai: skills?.advancedSkills?.filter((s: any) => s.category === 'ai').map((s: any) => s.skill) || [],
        cloud: skills?.advancedSkills?.filter((s: any) => s.category === 'cloud').map((s: any) => s.skill) || [],
      },
      softSkills: skills?.softSkills || [],
    }
    mutation.mutate(data)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Skills Management</h2>
      <p className="text-gray-600 mb-4">
        Skills are managed through the API. Use the seed script or update directly
        in the database for now. Full CRUD interface can be added if needed.
      </p>
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(skills, null, 2)}
        </pre>
      </div>
    </div>
  )
}

