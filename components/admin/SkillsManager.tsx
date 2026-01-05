'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import toast from 'react-hot-toast'

const categorySchema = z.object({
  title: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().default(0),
  tags: z.array(z.string()),
})

const skillSchema = z.object({
  name: z.string().min(1),
  level: z.number().min(0).max(100).default(0),
  order: z.number().default(0),
})

const advancedSkillSchema = z.object({
  category: z.enum(['ai', 'cloud']),
  skill: z.string().min(1),
  order: z.number().default(0),
})

const softSkillSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().default(0),
})

type CategoryFormData = z.infer<typeof categorySchema>
type SkillFormData = z.infer<typeof skillSchema>
type AdvancedSkillFormData = z.infer<typeof advancedSkillSchema>
type SoftSkillFormData = z.infer<typeof softSkillSchema>

export default function SkillsManager() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'categories' | 'advanced' | 'soft'>('categories')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editingCategoryIdForSkill, setEditingCategoryIdForSkill] = useState<string | null>(null)
  const [editingAdvancedSkillId, setEditingAdvancedSkillId] = useState<string | null>(null)
  const [editingSoftSkillId, setEditingSoftSkillId] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSkillForm, setShowSkillForm] = useState(false)
  const [showAdvancedSkillForm, setShowAdvancedSkillForm] = useState(false)
  const [showSoftSkillForm, setShowSoftSkillForm] = useState(false)

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['skill-categories'],
    queryFn: async () => {
      const res = await axios.get('/skills/categories')
      return res.data
    },
  })

  const { data: advancedSkills, isLoading: advancedLoading } = useQuery({
    queryKey: ['advanced-skills'],
    queryFn: async () => {
      const res = await axios.get('/skills/advanced')
      return res.data
    },
  })

  const { data: softSkills, isLoading: softLoading } = useQuery({
    queryKey: ['soft-skills'],
    queryFn: async () => {
      const res = await axios.get('/skills/soft')
      return res.data
    },
  })

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await axios.post('/skills/categories', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Category created successfully!')
      setShowCategoryForm(false)
      resetCategory()
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CategoryFormData }) => {
      const res = await axios.put(`/skills/categories/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Category updated successfully!')
      setEditingCategoryId(null)
      setShowCategoryForm(false)
      resetCategory()
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/skills/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Category deleted successfully!')
    },
  })

  // Skill mutations
  const createSkillMutation = useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: SkillFormData }) => {
      const res = await axios.post(`/skills/categories/${categoryId}/skills`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Skill created successfully!')
      setShowSkillForm(false)
      resetSkill()
    },
  })

  const updateSkillMutation = useMutation({
    mutationFn: async ({ categoryId, id, data }: { categoryId: string; id: string; data: SkillFormData }) => {
      const res = await axios.put(`/skills/categories/${categoryId}/skills/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Skill updated successfully!')
      setEditingSkillId(null)
      setEditingCategoryIdForSkill(null)
      setShowSkillForm(false)
      resetSkill()
    },
  })

  const deleteSkillMutation = useMutation({
    mutationFn: async ({ categoryId, id }: { categoryId: string; id: string }) => {
      await axios.delete(`/skills/categories/${categoryId}/skills/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Skill deleted successfully!')
    },
  })

  // Advanced skill mutations
  const createAdvancedSkillMutation = useMutation({
    mutationFn: async (data: AdvancedSkillFormData) => {
      const res = await axios.post('/skills/advanced', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Advanced skill created successfully!')
      setShowAdvancedSkillForm(false)
      resetAdvancedSkill()
    },
  })

  const updateAdvancedSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AdvancedSkillFormData }) => {
      const res = await axios.put(`/skills/advanced/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Advanced skill updated successfully!')
      setEditingAdvancedSkillId(null)
      setShowAdvancedSkillForm(false)
      resetAdvancedSkill()
    },
  })

  const deleteAdvancedSkillMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/skills/advanced/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advanced-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Advanced skill deleted successfully!')
    },
  })

  // Soft skill mutations
  const createSoftSkillMutation = useMutation({
    mutationFn: async (data: SoftSkillFormData) => {
      const res = await axios.post('/skills/soft', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soft-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Soft skill created successfully!')
      setShowSoftSkillForm(false)
      resetSoftSkill()
    },
  })

  const updateSoftSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: SoftSkillFormData }) => {
      const res = await axios.put(`/skills/soft/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soft-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Soft skill updated successfully!')
      setEditingSoftSkillId(null)
      setShowSoftSkillForm(false)
      resetSoftSkill()
    },
  })

  const deleteSoftSkillMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/skills/soft/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['soft-skills'] })
      queryClient.invalidateQueries({ queryKey: ['skills'] })
      toast.success('Soft skill deleted successfully!')
    },
  })

  // Category form
  const {
    register: registerCategory,
    handleSubmit: handleSubmitCategory,
    reset: resetCategory,
    setValue: setValueCategory,
    watch: watchCategory,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      tags: [],
      order: 0,
    },
  })

  const categoryTags = watchCategory('tags') || []

  const addCategoryTag = () => {
    const tag = prompt('Enter tag name:')
    if (tag) {
      setValueCategory('tags', [...categoryTags, tag])
    }
  }

  const removeCategoryTag = (index: number) => {
    setValueCategory('tags', categoryTags.filter((_, i) => i !== index))
  }

  // Skill form
  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    reset: resetSkill,
    setValue: setValueSkill,
  } = useForm<SkillFormData>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      level: 0,
      order: 0,
    },
  })

  // Advanced skill form
  const {
    register: registerAdvancedSkill,
    handleSubmit: handleSubmitAdvancedSkill,
    reset: resetAdvancedSkill,
    setValue: setValueAdvancedSkill,
  } = useForm<AdvancedSkillFormData>({
    resolver: zodResolver(advancedSkillSchema),
    defaultValues: {
      category: 'ai',
      order: 0,
    },
  })

  // Soft skill form
  const {
    register: registerSoftSkill,
    handleSubmit: handleSubmitSoftSkill,
    reset: resetSoftSkill,
    setValue: setValueSoftSkill,
  } = useForm<SoftSkillFormData>({
    resolver: zodResolver(softSkillSchema),
    defaultValues: {
      order: 0,
    },
  })

  const startEditCategory = (category: any) => {
    setEditingCategoryId(category.id)
    setShowCategoryForm(true)
    setValueCategory('title', category.title)
    setValueCategory('icon', category.icon || '')
    setValueCategory('order', category.order || 0)
    setValueCategory('tags', category.tags || [])
  }

  const startEditSkill = (categoryId: string, skill: any) => {
    setEditingCategoryIdForSkill(categoryId)
    setEditingSkillId(skill.id)
    setShowSkillForm(true)
    setValueSkill('name', skill.name)
    setValueSkill('level', skill.level || 0)
    setValueSkill('order', skill.order || 0)
  }

  const startEditAdvancedSkill = (skill: any) => {
    setEditingAdvancedSkillId(skill.id)
    setShowAdvancedSkillForm(true)
    setValueAdvancedSkill('category', skill.category)
    setValueAdvancedSkill('skill', skill.skill)
    setValueAdvancedSkill('order', skill.order || 0)
  }

  const startEditSoftSkill = (skill: any) => {
    setEditingSoftSkillId(skill.id)
    setShowSoftSkillForm(true)
    setValueSoftSkill('title', skill.title)
    setValueSoftSkill('description', skill.description)
    setValueSoftSkill('order', skill.order || 0)
  }

  const onSubmitCategory = (data: CategoryFormData) => {
    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, data })
    } else {
      createCategoryMutation.mutate(data)
    }
  }

  const onSubmitSkill = (data: SkillFormData) => {
    if (!editingCategoryIdForSkill) {
      toast.error('Please select a category')
      return
    }
    if (editingSkillId) {
      updateSkillMutation.mutate({ categoryId: editingCategoryIdForSkill, id: editingSkillId, data })
    } else {
      createSkillMutation.mutate({ categoryId: editingCategoryIdForSkill, data })
    }
  }

  const onSubmitAdvancedSkill = (data: AdvancedSkillFormData) => {
    if (editingAdvancedSkillId) {
      updateAdvancedSkillMutation.mutate({ id: editingAdvancedSkillId, data })
    } else {
      createAdvancedSkillMutation.mutate(data)
    }
  }

  const onSubmitSoftSkill = (data: SoftSkillFormData) => {
    if (editingSoftSkillId) {
      updateSoftSkillMutation.mutate({ id: editingSoftSkillId, data })
    } else {
      createSoftSkillMutation.mutate(data)
    }
  }

  const isLoading = categoriesLoading || advancedLoading || softLoading

  if (isLoading) {
    return <div>Loading...</div>
  }

  const aiSkills = advancedSkills?.filter((s: any) => s.category === 'ai') || []
  const cloudSkills = advancedSkills?.filter((s: any) => s.category === 'cloud') || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Skills Management</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Skill Categories
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'advanced'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advanced Skills
          </button>
          <button
            onClick={() => setActiveTab('soft')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'soft'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Soft Skills
          </button>
        </nav>
      </div>

      {/* Skill Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Skill Categories</h3>
            <button
              onClick={() => {
                setShowCategoryForm(!showCategoryForm)
                setEditingCategoryId(null)
                resetCategory()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showCategoryForm ? 'Cancel' : '+ Add Category'}
            </button>
          </div>

          {showCategoryForm && (
            <form
              onSubmit={handleSubmitCategory(onSubmitCategory)}
              className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  {...registerCategory('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon (FontAwesome class)
                </label>
                <input
                  {...registerCategory('icon')}
                  placeholder="fas fa-code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categoryTags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeCategoryTag(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addCategoryTag}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Tag
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  {...registerCategory('order', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingCategoryId ? 'Update' : 'Create'} Category
              </button>
            </form>
          )}

          <div className="space-y-4">
            {categories?.map((category: any) => (
              <div
                key={category.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-lg">{category.title}</h4>
                    {category.icon && (
                      <span className="text-gray-600 text-sm">
                        <i className={category.icon}></i> {category.icon}
                      </span>
                    )}
                    {category.tags && category.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {category.tags.map((tag: string, i: number) => (
                          <span
                            key={i}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditCategory(category)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategoryIdForSkill(category.id)
                        setShowSkillForm(true)
                        resetSkill()
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      + Add Skill
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this category?')) {
                          deleteCategoryMutation.mutate(category.id)
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {category.skills && category.skills.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {category.skills.map((skill: any) => (
                      <div
                        key={skill.id}
                        className="bg-gray-50 p-3 rounded flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-gray-600 ml-2">
                            Level: {skill.level}%
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditSkill(category.id, skill)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this skill?')) {
                                deleteSkillMutation.mutate({ categoryId: category.id, id: skill.id })
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {showSkillForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-xl font-semibold mb-4">
                  {editingSkillId ? 'Edit Skill' : 'Add Skill'}
                </h3>
                <form onSubmit={handleSubmitSkill(onSubmitSkill)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      {...registerSkill('name')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...registerSkill('level', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      {...registerSkill('order', { valueAsNumber: true })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {editingSkillId ? 'Update' : 'Create'} Skill
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSkillForm(false)
                        setEditingSkillId(null)
                        setEditingCategoryIdForSkill(null)
                        resetSkill()
                      }}
                      className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advanced Skills Tab */}
      {activeTab === 'advanced' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Skills</h3>
            <button
              onClick={() => {
                setShowAdvancedSkillForm(!showAdvancedSkillForm)
                setEditingAdvancedSkillId(null)
                resetAdvancedSkill()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showAdvancedSkillForm ? 'Cancel' : '+ Add Advanced Skill'}
            </button>
          </div>

          {showAdvancedSkillForm && (
            <form
              onSubmit={handleSubmitAdvancedSkill(onSubmitAdvancedSkill)}
              className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...registerAdvancedSkill('category')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="ai">AI</option>
                  <option value="cloud">Cloud</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill
                </label>
                <input
                  {...registerAdvancedSkill('skill')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  {...registerAdvancedSkill('order', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={createAdvancedSkillMutation.isPending || updateAdvancedSkillMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingAdvancedSkillId ? 'Update' : 'Create'} Advanced Skill
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">AI Skills</h4>
              <div className="space-y-2">
                {aiSkills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                  >
                    <span>{skill.skill}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditAdvancedSkill(skill)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this skill?')) {
                            deleteAdvancedSkillMutation.mutate(skill.id)
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Cloud Skills</h4>
              <div className="space-y-2">
                {cloudSkills.map((skill: any) => (
                  <div
                    key={skill.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center"
                  >
                    <span>{skill.skill}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditAdvancedSkill(skill)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this skill?')) {
                            deleteAdvancedSkillMutation.mutate(skill.id)
                          }
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Soft Skills Tab */}
      {activeTab === 'soft' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Soft Skills</h3>
            <button
              onClick={() => {
                setShowSoftSkillForm(!showSoftSkillForm)
                setEditingSoftSkillId(null)
                resetSoftSkill()
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {showSoftSkillForm ? 'Cancel' : '+ Add Soft Skill'}
            </button>
          </div>

          {showSoftSkillForm && (
            <form
              onSubmit={handleSubmitSoftSkill(onSubmitSoftSkill)}
              className="bg-gray-50 p-6 rounded-lg mb-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  {...registerSoftSkill('title')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...registerSoftSkill('description')}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <input
                  type="number"
                  {...registerSoftSkill('order', { valueAsNumber: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={createSoftSkillMutation.isPending || updateSoftSkillMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingSoftSkillId ? 'Update' : 'Create'} Soft Skill
              </button>
            </form>
          )}

          <div className="space-y-4">
            {softSkills?.map((skill: any) => (
              <div
                key={skill.id}
                className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start"
              >
                <div>
                  <h4 className="font-semibold text-lg">{skill.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{skill.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditSoftSkill(skill)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this soft skill?')) {
                        deleteSoftSkillMutation.mutate(skill.id)
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
      )}
    </div>
  )
}
