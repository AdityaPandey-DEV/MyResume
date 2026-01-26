'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
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
  isActive: z.boolean().default(true),
  isTrending: z.boolean().default(false),
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

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await axios.post('/skills/categories', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      toast.success('Category created!')
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
      toast.success('Category updated!')
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
      toast.success('Category deleted!')
    },
  })

  const createSkillMutation = useMutation({
    mutationFn: async ({ categoryId, data }: { categoryId: string; data: SkillFormData }) => {
      const res = await axios.post(`/skills/categories/${categoryId}/skills`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      toast.success('Skill created!')
      setShowSkillForm(false)
      resetSkill()
    },
  })

  const updateSkillMutation = useMutation({
    mutationFn: async ({ categoryId, id, data }: { categoryId: string; id: string; data: Partial<SkillFormData> }) => {
      const res = await axios.put(`/skills/categories/${categoryId}/skills/${id}`, data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-categories'] })
      toast.success('Skill updated!')
      setEditingSkillId(null)
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
      toast.success('Skill deleted!')
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
    defaultValues: { tags: [], order: 0 },
  })

  const categoryTags = watchCategory('tags') || []

  const addCategoryTag = () => {
    const tag = prompt('Enter tag name:')
    if (tag) setValueCategory('tags', [...categoryTags, tag])
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
    defaultValues: { level: 0, order: 0, isActive: true, isTrending: false },
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
    setValueSkill('isActive', skill.isActive ?? true)
    setValueSkill('isTrending', skill.isTrending ?? false)
  }

  const onSubmitCategory = (data: CategoryFormData) => {
    if (editingCategoryId) {
      updateCategoryMutation.mutate({ id: editingCategoryId, data })
    } else {
      createCategoryMutation.mutate(data)
    }
  }

  const onSubmitSkill = (data: SkillFormData) => {
    if (!editingCategoryIdForSkill) return
    if (editingSkillId) {
      updateSkillMutation.mutate({ categoryId: editingCategoryIdForSkill, id: editingSkillId, data })
    } else {
      createSkillMutation.mutate({ categoryId: editingCategoryIdForSkill, data })
    }
  }

  const isLoading = categoriesLoading || advancedLoading || softLoading

  if (isLoading) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Skills Management</h2>
      </div>

      <nav className="flex gap-4 border-b border-gray-200">
        {(['categories', 'advanced', 'soft'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              } uppercase tracking-wider`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700 uppercase text-sm">Categories</h3>
            <button
              onClick={() => { setShowCategoryForm(!showCategoryForm); setEditingCategoryId(null); resetCategory(); }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-sm"
            >
              {showCategoryForm ? 'Cancel' : '+ Add Category'}
            </button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleSubmitCategory(onSubmitCategory)} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                  <input {...registerCategory('title')} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Icon (FA Class)</label>
                  <input {...registerCategory('icon')} className="w-full px-4 py-2 border rounded-lg" placeholder="fas fa-code" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categoryTags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => removeCategoryTag(i)} className="text-red-400 hover:text-red-600">×</button>
                    </span>
                  ))}
                  <button type="button" onClick={addCategoryTag} className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600">
                    + Add Tag
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
                {editingCategoryId ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 gap-4">
            {categories?.map((category: any) => (
              <div key={category.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm border border-gray-100">
                      <i className={category.icon || 'fas fa-code'}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{category.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{category.skills?.length || 0} Skills</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditCategory(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><i className="fas fa-edit"></i></button>
                    <button onClick={() => { setEditingCategoryIdForSkill(category.id); setShowSkillForm(true); resetSkill(); }} className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition">+ Skill</button>
                    <button onClick={() => deleteCategoryMutation.mutate(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><i className="fas fa-trash"></i></button>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {category.skills?.map((skill: any) => (
                    <div key={skill.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-50 hover:border-gray-100 transition shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-gray-700">{skill.name}</span>
                          <div className="w-24 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${skill.level}%` }}></div>
                          </div>
                        </div>
                        {skill.isTrending && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[8px] font-bold rounded uppercase tracking-tighter">Trending</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateSkillMutation.mutate({ categoryId: category.id, id: skill.id, data: { isActive: !skill.isActive } })}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${skill.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                            }`}
                        >
                          {skill.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                        <button onClick={() => startEditSkill(category.id, skill)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"><i className="fas fa-edit text-xs"></i></button>
                        <button onClick={() => deleteSkillMutation.mutate({ categoryId: category.id, id: skill.id })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"><i className="fas fa-trash text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showSkillForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-gray-800">{editingSkillId ? 'Edit Skill' : 'Add New Skill'}</h3>
            <form onSubmit={handleSubmitSkill(onSubmitSkill)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Name</label>
                <input {...registerSkill('name')} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Level (%)</label>
                  <input type="number" {...registerSkill('level', { valueAsNumber: true })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order</label>
                  <input type="number" {...registerSkill('order', { valueAsNumber: true })} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="flex items-center gap-4 py-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...registerSkill('isActive')} className="rounded text-blue-600" />
                  <span className="text-sm font-bold text-gray-600">Visible on Resume</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...registerSkill('isTrending')} className="rounded text-yellow-500" />
                  <span className="text-sm font-bold text-gray-600">Trending Skill</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg transition active:scale-95">
                  {editingSkillId ? 'Update' : 'Create'} Skill
                </button>
                <button type="button" onClick={() => setShowSkillForm(false)} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
