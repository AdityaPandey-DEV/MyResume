'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

const educationSchema = z.object({
  level: z.string().min(1),
  duration: z.string().min(1),
  degree: z.string().min(1),
  institution: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().optional(),
  bgColor: z.string().optional(),
  lightText: z.string().optional(),
  pillBg: z.string().optional(),
  pillText: z.string().optional(),
  skills: z.array(z.string()),
  order: z.number().default(0),
})

type EducationFormData = z.infer<typeof educationSchema>

export default function EducationManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: education, isLoading } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      const res = await axios.get('/education')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: EducationFormData) => {
      const res = await axios.post('/education', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('Education entry created successfully!')
      setShowForm(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EducationFormData }) => {
      const res = await axios.put(`/education/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('Education entry updated successfully!')
      setEditingId(null)
      setShowForm(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/education/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] })
      toast.success('Education entry deleted successfully!')
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      skills: [],
      order: 0,
    },
  })

  const skills = watch('skills') || []

  const addSkill = () => {
    const skill = prompt('Enter skill name:')
    if (skill) {
      setValue('skills', [...skills, skill])
    }
  }

  const removeSkill = (index: number) => {
    setValue('skills', skills.filter((_, i) => i !== index))
  }

  const startEdit = (edu: any) => {
    setEditingId(edu.id)
    setShowForm(true)
    setValue('level', edu.level)
    setValue('duration', edu.duration)
    setValue('degree', edu.degree)
    setValue('institution', edu.institution)
    setValue('description', edu.description)
    setValue('icon', edu.icon || '')
    setValue('bgColor', edu.bgColor || '')
    setValue('lightText', edu.lightText || '')
    setValue('pillBg', edu.pillBg || '')
    setValue('pillText', edu.pillText || '')
    setValue('skills', edu.skills || [])
    setValue('order', edu.order || 0)
  }

  const onSubmit = (data: EducationFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Education</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            reset()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Education'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <input
                {...register('level')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <input
                {...register('duration')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree
              </label>
              <input
                {...register('degree')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution
              </label>
              <input
                {...register('institution')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={addSkill}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Skill
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <input
                {...register('icon')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color (Tailwind class)
              </label>
              <input
                {...register('bgColor')}
                placeholder="bg-blue-600"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Create'} Education
          </button>
        </form>
      )}

      <div className="space-y-4">
        {education?.map((edu: any) => (
          <div
            key={edu.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold text-lg">{edu.degree}</h3>
              <p className="text-gray-600 text-sm">{edu.institution}</p>
              <p className="text-gray-500 text-xs mt-1">{edu.duration}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(edu)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this education entry?')) {
                    deleteMutation.mutate(edu.id)
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

