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
  imageUrl: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  order: z.number().default(0),
  isVisible: z.boolean().default(true),
})

type CertificationFormData = z.infer<typeof certificationSchema>

export default function CertificationsManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active')

  const { data: certifications, isLoading } = useQuery({
    queryKey: ['certifications'],
    queryFn: async () => {
      const res = await axios.get('/certifications?admin=true')
      return res.data
    },
  })

  const filteredCertifications = certifications?.filter((cert: any) =>
    activeTab === 'active' ? (cert.isVisible !== false) : (cert.isVisible === false)
  )

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

  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/certifications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const imageUrl = res.data.imageUrl
      setValue('imageUrl', imageUrl)
      setImagePreview(imageUrl)
      toast.success('Image uploaded successfully!')
      return imageUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
      handleImageUpload(file)
    }
  }

  const onSubmit = (data: CertificationFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const toggleVisibility = (cert: any) => {
    updateMutation.mutate({
      id: cert.id,
      data: { ...cert, isVisible: !cert.isVisible } as any
    })
  }

  // ... (startEdit needs update too, doing in separate chunk or merged)

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Manage Certifications</h2>
        <div className="flex gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'active' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'inactive' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Inactive
            </button>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              reset()
              setImagePreview(null)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Add Certification'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Certification Name"
              />
              {/* @ts-ignore */}
              {/* errors.title is not strictly typed here but handled by RHF */}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                {...register('organization')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Issuing Organization"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                {...register('date')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Dec 2023"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate URL</label>
              <input
                {...register('certificateUrl')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Image Upload Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certificate Image/Preview
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="relative w-24 h-16 rounded overflow-hidden border border-gray-300">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setValue('imageUrl', '')
                      setImagePreview(null)
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  disabled={uploadingImage}
                />
                {uploadingImage && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
              </div>
            </div>
            <input type="hidden" {...register('imageUrl')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Brief description of the certification..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag: string, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(index)} className="hover:text-blue-900">×</button>
                </span>
              ))}
              <button
                type="button"
                onClick={addTag}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Tag
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon Class</label>
              <input
                {...register('icon')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. fas fa-certificate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                {...register('color')}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. #0077b5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
              <input
                type="number"
                {...register('order', { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isVisible"
                {...register('isVisible')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">Visible on Site</label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                reset()
                setImagePreview(null)
                setEditingId(null)
              }}
              className="px-4 py-2 border text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || uploadingImage}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {editingId ? 'Update' : 'Create'} Certification
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {filteredCertifications?.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            No {activeTab} certifications found.
          </div>
        )}
        {filteredCertifications?.map((cert: any) => (
          <div
            key={cert.id}
            className={`bg-white border rounded-lg p-4 flex justify-between items-center ${!cert.isVisible ? 'border-l-4 border-l-gray-300 opacity-75' : 'border-l-4 border-l-green-500'}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{cert.title}</h3>
                {!cert.isVisible && <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">Hidden</span>}
              </div>
              <p className="text-gray-600 text-sm">{cert.organization}</p>
              <p className="text-gray-500 text-xs mt-1">{cert.date}</p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => toggleVisibility(cert)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${cert.isVisible ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {cert.isVisible ? 'Hide' : 'Make Active'}
              </button>
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

