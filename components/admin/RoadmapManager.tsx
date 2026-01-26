'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

type RoadmapItem = {
    id: string
    title: string
    description: string
    targetDate: string | null
    isCompleted: boolean
    type: string
    order: number
}

export default function RoadmapManager() {
    const [items, setItems] = useState<RoadmapItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null)

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        targetDate: '',
        type: 'milestone',
        order: 0
    })

    const fetchRoadmap = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/career/roadmap')
            const data = await res.json()
            if (data.success) setItems(data.items)
        } catch (e) {
            toast.error('Failed to load roadmap')
        } finally {
            setIsLoading(false)
        }
    }

    const saveItem = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const method = editingItem ? 'PUT' : 'POST'
            const body = editingItem ? { ...newItem, id: editingItem.id } : newItem

            const res = await fetch('/api/career/roadmap', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (data.success) {
                toast.success(editingItem ? 'Milestone updated!' : 'Milestone added!')
                setShowAddForm(false)
                setEditingItem(null)
                setNewItem({ title: '', description: '', targetDate: '', type: 'milestone', order: 0 })
                fetchRoadmap()
            }
        } catch (e) {
            toast.error('Failed to save milestone')
        }
    }

    const toggleComplete = async (item: RoadmapItem) => {
        try {
            const res = await fetch('/api/career/roadmap', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id, isCompleted: !item.isCompleted })
            })
            if ((await res.json()).success) {
                toast.success(item.isCompleted ? 'Marked as incomplete' : 'Milestone completed! 🎉')
                fetchRoadmap()
            }
        } catch (e) {
            toast.error('Failed to update status')
        }
    }

    useEffect(() => {
        fetchRoadmap()
    }, [])

    if (isLoading) return <div className="p-8 text-center">Loading Roadmap...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Career Roadmap</h2>
                    <p className="text-gray-600">Plan and track your professional milestones and long-term goals.</p>
                </div>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingItem(null); }}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"
                >
                    {showAddForm ? 'Cancel' : '+ Add Milestone'}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={saveItem} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Title</label>
                            <input required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Master System Design" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Type</label>
                            <select value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                <option value="milestone">General Milestone</option>
                                <option value="skill">Skill Acquisition</option>
                                <option value="job">Job Target</option>
                                <option value="certificate">Certification</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                        <textarea required value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg h-24" placeholder="What exactly do you want to achieve?" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Date</label>
                            <input value={newItem.targetDate || ''} onChange={e => setNewItem({ ...newItem, targetDate: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="e.g., Q3 2026" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Order</label>
                            <input type="number" value={newItem.order} onChange={e => setNewItem({ ...newItem, order: parseInt(e.target.value) })} className="w-full px-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-md">
                        {editingItem ? 'Update Milestone' : 'Save Milestone'}
                    </button>
                </form>
            )}

            <div className="relative border-l-2 border-indigo-100 ml-4 space-y-8 pb-8">
                {items.length === 0 && <p className="text-gray-400 italic text-sm ml-8">Your roadmap is currently empty.</p>}
                {items.map((item, idx) => (
                    <div key={item.id} className="relative pl-10 group">
                        {/* Dot */}
                        <div className={`absolute left-[-11px] top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all ${item.isCompleted ? 'bg-green-500' : 'bg-indigo-400 group-hover:scale-125'}`}></div>

                        <div className={`p-6 rounded-2xl border transition-all ${item.isCompleted ? 'bg-green-50/30 border-green-100 opacity-75' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'skill' ? 'bg-blue-50 text-blue-600' :
                                                item.type === 'job' ? 'bg-purple-50 text-purple-600' :
                                                    item.type === 'certificate' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-gray-50 text-gray-600'
                                            }`}>
                                            {item.type}
                                        </span>
                                        {item.targetDate && <span className="text-xs text-gray-400 font-medium tracking-tight">Target: {item.targetDate}</span>}
                                    </div>
                                    <h4 className={`text-xl font-bold mt-1 ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                        {item.title}
                                    </h4>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleComplete(item)}
                                        className={`p-2 rounded-lg transition ${item.isCompleted ? 'text-green-600 bg-green-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                        title={item.isCompleted ? "Mark Incomplete" : "Mark Complete"}
                                    >
                                        <i className={`fas ${item.isCompleted ? 'fa-check-circle' : 'fa-circle'}`}></i>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingItem(item)
                                            setNewItem({ title: item.title, description: item.description, targetDate: item.targetDate || '', type: item.type, order: item.order })
                                            setShowAddForm(true)
                                            window.scrollTo({ top: 0, behavior: 'smooth' })
                                        }}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        <i className="fas fa-edit text-sm"></i>
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
