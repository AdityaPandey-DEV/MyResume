'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'
import {
  useFeaturedProjects,
  useCreateFeaturedProject,
  useUpdateFeaturedProject,
  useDeleteFeaturedProject,
} from '@/hooks/useFeaturedProjects'

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  technologies: z.array(z.string()),
  icon: z.string().optional(),
  gradient: z.string().optional(),
  imageUrl: z.string().optional(),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveDemoUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().default(0),
})

const featuredProjectSchema = z.object({
  imageUrl: z.string().url().optional().or(z.literal('')),
  technologies: z.array(z.string()),
  keyFeatures: z.array(
    z.object({
      feature: z.string().min(1),
    })
  ),
})

type ProjectFormData = z.infer<typeof projectSchema>
type FeaturedProjectFormData = z.infer<typeof featuredProjectSchema>

export default function ProjectsManager() {
  const queryClient = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showFeaturedForm, setShowFeaturedForm] = useState(false)
  const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(
    null
  )
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { data: featuredProjects } = useFeaturedProjects()
  const createFeaturedMutation = useCreateFeaturedProject()
  const updateFeaturedMutation = useUpdateFeaturedProject()
  const deleteFeaturedMutation = useDeleteFeaturedProject()

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await axios.get('/projects')
      return res.data
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await axios.post('/projects', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully!')
      setShowForm(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to create project')
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProjectFormData }) => {
      const res = await axios.put(`/projects/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully!')
      setEditingId(null)
      setShowForm(false)
      resetForm()
    },
    onError: () => {
      toast.error('Failed to update project')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/projects/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully!')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      technologies: [],
      order: 0,
    },
  })

  const technologies = watch('technologies') || []

  const addTechnology = () => {
    const tech = prompt('Enter technology name:')
    if (tech) {
      setValue('technologies', [...technologies, tech])
    }
  }

  const removeTechnology = (index: number) => {
    setValue(
      'technologies',
      technologies.filter((_, i) => i !== index)
    )
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/projects/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
      // Show preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload image
      handleImageUpload(file)
    }
  }

  const startEdit = (project: any) => {
    setEditingId(project.id)
    setShowForm(true)
    setValue('title', project.title)
    setValue('description', project.description)
    setValue('technologies', project.technologies || [])
    setValue('icon', project.icon || '')
    setValue('gradient', project.gradient || '')
    setValue('imageUrl', project.imageUrl || '')
    setValue('githubUrl', project.githubUrl || '')
    setValue('liveDemoUrl', project.liveDemoUrl || '')
    setValue('order', project.order || 0)
    setImagePreview(project.imageUrl || null)
  }

  const onSubmit = async (data: ProjectFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const resetForm = () => {
    reset()
    setImagePreview(null)
    setEditingId(null)
  }

  // Featured Project Form
  const {
    register: registerFeatured,
    handleSubmit: handleSubmitFeatured,
    control: controlFeatured,
    reset: resetFeatured,
    setValue: setValueFeatured,
    watch: watchFeatured,
  } = useForm<FeaturedProjectFormData>({
    resolver: zodResolver(featuredProjectSchema),
    defaultValues: {
      imageUrl: '',
      technologies: [],
      keyFeatures: [],
    },
  })

  const {
    fields: keyFeatureFields,
    append: appendKeyFeature,
    remove: removeKeyFeature,
  } = useFieldArray({
    control: controlFeatured,
    name: 'keyFeatures',
  })

  const featuredTechnologies = watchFeatured('technologies') || []

  const addFeaturedTechnology = () => {
    const tech = prompt('Enter technology name:')
    if (tech) {
      setValueFeatured('technologies', [...featuredTechnologies, tech])
    }
  }

  const removeFeaturedTechnology = (index: number) => {
    setValueFeatured(
      'technologies',
      featuredTechnologies.filter((_, i) => i !== index)
    )
  }

  const openFeaturedForm = (project: any) => {
    const existing = featuredProjects?.find(
      (fp) => fp.projectId === project.id
    )
    if (existing) {
      setFeaturedProjectId(existing.id)
      setValueFeatured('imageUrl', existing.imageUrl || '')
      setValueFeatured('technologies', existing.technologies || [])
      setValueFeatured(
        'keyFeatures',
        existing.keyFeatures.map((kf) => ({ feature: kf.feature })) || []
      )
    } else {
      setFeaturedProjectId(null)
      setSelectedProjectId(project.id)
      resetFeatured()
    }
    setShowFeaturedForm(true)
  }

  const closeFeaturedForm = () => {
    setShowFeaturedForm(false)
    setFeaturedProjectId(null)
    setSelectedProjectId(null)
    resetFeatured()
  }

  const onSubmitFeatured = (data: FeaturedProjectFormData) => {
    if (featuredProjectId) {
      // Update existing
      updateFeaturedMutation.mutate(
        {
          id: featuredProjectId,
          data: {
            imageUrl: data.imageUrl || undefined,
            technologies: data.technologies,
            keyFeatures: data.keyFeatures.map((kf) => kf.feature),
          },
        },
        {
          onSuccess: () => {
            toast.success('Featured project updated successfully!')
            closeFeaturedForm()
          },
          onError: () => {
            toast.error('Failed to update featured project')
          },
        }
      )
    } else if (selectedProjectId) {
      // Create new
      createFeaturedMutation.mutate(
        {
          projectId: selectedProjectId,
          imageUrl: data.imageUrl || undefined,
          technologies: data.technologies,
          keyFeatures: data.keyFeatures.map((kf) => kf.feature),
        },
        {
          onSuccess: () => {
            toast.success('Project marked as featured!')
            closeFeaturedForm()
          },
          onError: () => {
            toast.error('Failed to create featured project')
          },
        }
      )
    }
  }

  const removeFeatured = (featuredProjectId: string) => {
    if (confirm('Are you sure you want to remove featured status?')) {
      deleteFeaturedMutation.mutate(featuredProjectId, {
        onSuccess: () => {
          toast.success('Featured status removed')
        },
        onError: () => {
          toast.error('Failed to remove featured status')
        },
      })
    }
  }

  const isProjectFeatured = (projectId: string) => {
    return featuredProjects?.some((fp) => fp.projectId === projectId)
  }

  const getFeaturedProject = (projectId: string) => {
    return featuredProjects?.find((fp) => fp.projectId === projectId)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => {
            setShowForm(!showForm)
            resetForm()
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4">
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
              Project Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {uploadingImage && (
              <p className="text-sm text-gray-500 mt-1">Uploading image...</p>
            )}
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null)
                    setValue('imageUrl', '')
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            )}
            <input
              type="hidden"
              {...register('imageUrl')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Technologies
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechnology(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={addTechnology}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Technology
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon (FontAwesome class)
              </label>
              <input
                {...register('icon')}
                placeholder="fas fa-code"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gradient (Tailwind classes)
              </label>
              <input
                {...register('gradient')}
                placeholder="from-blue-400 to-indigo-500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub URL
              </label>
              <input
                {...register('githubUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Live Demo URL
              </label>
              <input
                {...register('liveDemoUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {editingId ? 'Update' : 'Create'} Project
          </button>
        </form>
      )}

      {/* Featured Project Form Modal */}
      {showFeaturedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {featuredProjectId ? 'Edit Featured Project' : 'Mark as Featured'}
              </h3>
              <button
                onClick={closeFeaturedForm}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmitFeatured(onSubmitFeatured)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  {...registerFeatured('imageUrl')}
                  type="url"
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies (for spotlight)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {featuredTechnologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeFeaturedTechnology(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addFeaturedTechnology}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Technology
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Features
                </label>
                <div className="space-y-2 mb-2">
                  {keyFeatureFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <input
                        {...registerFeatured(`keyFeatures.${index}.feature`)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter key feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeyFeature(index)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => appendKeyFeature({ feature: '' })}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Key Feature
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={
                    createFeaturedMutation.isPending ||
                    updateFeaturedMutation.isPending
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {featuredProjectId ? 'Update' : 'Create'} Featured Project
                </button>
                <button
                  type="button"
                  onClick={closeFeaturedForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {projects?.map((project: any) => {
          const isFeatured = isProjectFeatured(project.id)
          const featuredProject = getFeaturedProject(project.id)

          return (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  {isFeatured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.technologies?.map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(project)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
                {isFeatured ? (
                  <>
                    <button
                      onClick={() => openFeaturedForm(project)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Edit Featured
                    </button>
                    <button
                      onClick={() => removeFeatured(featuredProject!.id)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Remove Featured
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openFeaturedForm(project)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Mark as Featured
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this project?')) {
                      deleteMutation.mutate(project.id)
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

