'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

const certificationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  organization: z.string().min(1),
  date: z.string().min(1),
  tags: z.array(z.string()),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().default(0),
})

type CertificationFormData = z.infer<typeof certificationSchema>

export default function CertificationsManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: certifications, isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const res = await axios.get('/certifications')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: CertificationFormData) => {
      const res = await axios.post('/certifications', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] })
      toast.success('Certification created successfully!')
      setShowForm(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CertificationFormData }) => {
      const res = await axios.put(`/certifications/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] })
      toast.success('Certification updated successfully!')
      setEditingId(null)
      setShowForm(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/certifications/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certifications'] })
      toast.success('Certification deleted successfully!')
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      tags: [],
      order: 0,
    },
  })

  const tags = watch('tags') || []

  const addTag = () => {
    const tag = prompt('Enter tag name:')
    if (tag) {
      setValue('tags', [...tags, tag])
    }
  }

  const removeTag = (index: number) => {
    setValue('tags', tags.filter((_, i) => i !== index))
  }

  const startEdit = (cert: any) => {
    setEditingId(cert.id)
    setShowForm(true)
    setValue('title', cert.title)
    setValue('description', cert.description)
    setValue('organization', cert.organization)
    setValue('date', cert.date)
    setValue('tags', cert.tags || [])
    setValue('certificateUrl', cert.certificateUrl || '')
    setValue('icon', cert.icon || '')
    setValue('color', cert.color || '')
    setValue('order', cert.order || 0)
  }

  const onSubmit = (data: CertificationFormData) => {
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
        <h2 className="text-xl font-semibold">Certifications</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            reset()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Certification'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization
              </label>
              <input
                {...register('organization')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                {...register('date')}
                placeholder="September 2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate URL
              </label>
              <input
                {...register('certificateUrl')}
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
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={addTag}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Tag
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon (FontAwesome class)
              </label>
              <input
                {...register('icon')}
                placeholder="fas fa-certificate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color (Tailwind class)
              </label>
              <input
                {...register('color')}
                placeholder="blue"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Create'} Certification
          </button>
        </form>
      )}

      <div className="space-y-4">
        {certifications?.map((cert: any) => (
          <div
            key={cert.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold text-lg">{cert.title}</h3>
              <p className="text-gray-600 text-sm">{cert.organization}</p>
              <p className="text-gray-500 text-xs mt-1">{cert.date}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(cert)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this certification?')) {
                    deleteMutation.mutate(cert.id)
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

