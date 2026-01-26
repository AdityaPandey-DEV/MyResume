'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

type TargetJob = {
    id: string
    company: string
    role: string
    location: string | null
    hrName: string | null
    hrEmail: string | null
    hrLinkedIn: string | null
    referralEmail: string | null
    referralLinkedIn: string | null
    connectionNote: string | null
    status: string
    jobUrl: string | null
}

export default function JobHunter() {
    const [jobs, setJobs] = useState<TargetJob[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState<string | null>(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [selectedJob, setSelectedJob] = useState<TargetJob | null>(null)
    const [resumeUrl, setResumeUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isActivelyLooking, setIsActivelyLooking] = useState(true)

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await fetch('/api/career/jobs/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (data.success) {
                toast.success('Resume updated!')
                setResumeUrl(data.profile.resumeUrl)
            }
        } catch (e) {
            toast.error('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    // Form State
    const [newJob, setNewJob] = useState({
        company: '',
        role: '',
        location: '',
        jobUrl: '',
        hrName: '',
        hrEmail: '',
        hrLinkedIn: ''
    })

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/career/jobs')
            const data = await res.json()
            if (data.success) {
                setJobs(data.jobs)
                setResumeUrl(data.profile?.resumeUrl || null)
                setIsActivelyLooking(data.profile?.isActivelyLooking ?? true)
            }
        } catch (e) {
            toast.error('Failed to load jobs')
        } finally {
            setIsLoading(false)
        }
    }

    const addJob = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/career/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newJob)
            })
            const data = await res.json()
            if (data.success) {
                toast.success('Job saved!')
                setShowAddForm(false)
                setNewJob({ company: '', role: '', location: '', jobUrl: '', hrName: '', hrEmail: '', hrLinkedIn: '' })
                fetchJobs()
            }
        } catch (e) {
            toast.error('Failed to save job')
        }
    }

    const addToRoadmap = async (job: TargetJob) => {
        try {
            const res = await fetch('/api/career/roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `Apply to ${job.company}`,
                    description: `Goal: Secure a ${job.role} position at ${job.company}.`,
                    type: 'job',
                    order: 0
                })
            })
            if ((await res.json()).success) {
                toast.success('Job added to your Career Roadmap! 🎯')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const generateOutreach = async (jobId: string) => {
        setIsGenerating(jobId)
        try {
            const res = await fetch('/api/career/jobs/outreach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            })
            const data = await res.json()
            if (data.success) {
                toast.success('AI outreach messages generated!')
                fetchJobs()
                if (selectedJob?.id === jobId) setSelectedJob(data.job)
            }
        } catch (e) {
            toast.error('AI generation failed')
        } finally {
            setIsGenerating(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard!')
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    if (isLoading) return <div className="p-8 text-center">Loading Job Hunter...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-800">Job Hunt Assistant</h2>
                    <p className="text-gray-600">Track target jobs and generate AI-powered outreach tailored to your profile.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Career Profile</span>
                            <div className="flex items-center gap-2 mt-1">
                                {resumeUrl ? (
                                    <a href={resumeUrl} target="_blank" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                                        <i className="fas fa-file-pdf"></i> Resume.pdf
                                    </a>
                                ) : (
                                    <span className="text-gray-300 font-bold text-sm italic">No Resume</span>
                                )}
                            </div>
                        </div>
                        <label className="cursor-pointer px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100 transition border border-gray-100">
                            {isUploading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload mr-2"></i>}
                            {resumeUrl ? 'Update' : 'Upload'} Resume
                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} className="hidden" />
                        </label>
                    </div>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg h-full"
                    >
                        {showAddForm ? 'Cancel' : '+ Track Job'}
                    </button>
                </div>
            </div>

            {showAddForm && (
                <form onSubmit={addJob} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Company</label>
                            <input required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Google" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Role</label>
                            <input required value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Full Stack Developer" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Location</label>
                            <input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Remote / Bengaluru" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HR/Recruiter Name</label>
                            <input value={newJob.hrName} onChange={e => setNewJob({ ...newJob, hrName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HR Email</label>
                            <input value={newJob.hrEmail} onChange={e => setNewJob({ ...newJob, hrEmail: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="john@company.com" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">HR LinkedIn</label>
                            <input value={newJob.hrLinkedIn} onChange={e => setNewJob({ ...newJob, hrLinkedIn: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="LinkedIn URL" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">Save Target Job</button>
                </form>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Job List */}
                <div className="xl:col-span-1 space-y-4">
                    <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Target Companies</h3>
                    {jobs.length === 0 && <p className="text-gray-400 italic text-sm">No jobs tracked yet.</p>}
                    {jobs.map(job => (
                        <div
                            key={job.id}
                            onClick={() => setSelectedJob(job)}
                            className={`p-5 rounded-xl border border-gray-100 cursor-pointer transition-all hover:shadow-md ${selectedJob?.id === job.id ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-800">{job.company}</h4>
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-500">{job.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{job.role}</p>
                            <p className="text-xs text-gray-400 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {job.location || 'Unknown'}</p>
                        </div>
                    ))}
                </div>

                {/* Selected Job Actions */}
                <div className="xl:col-span-2">
                    {selectedJob ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{selectedJob.company}</h3>
                                        <p className="text-lg text-blue-600 font-semibold">{selectedJob.role}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => addToRoadmap(selectedJob)}
                                            className="flex items-center gap-2 px-5 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-all"
                                        >
                                            <i className="fas fa-map"></i>
                                            Add to Roadmap
                                        </button>
                                        <button
                                            onClick={() => generateOutreach(selectedJob.id)}
                                            disabled={isGenerating === selectedJob.id}
                                            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-bold text-sm shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                                        >
                                            {isGenerating === selectedJob.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                                            AI Generate Outreach
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-6 text-sm text-gray-600">
                                    {selectedJob.hrName && <div className="flex items-center gap-2"><i className="fas fa-id-card text-gray-400"></i> {selectedJob.hrName}</div>}
                                    {selectedJob.hrEmail && <div className="flex items-center gap-2"><i className="fas fa-envelope text-gray-400"></i> {selectedJob.hrEmail}</div>}
                                    {selectedJob.hrLinkedIn && (
                                        <a href={selectedJob.hrLinkedIn} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1">
                                            <i className="fab fa-linkedin"></i> HR Profile
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Connection Note */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-widest leading-none">
                                            <i className="fas fa-paper-plane text-blue-500"></i> LinkedIn Connection Note
                                            <span className="text-[9px] font-normal text-gray-400">(Max 300 chars)</span>
                                        </h4>
                                        {selectedJob.connectionNote && (
                                            <button onClick={() => copyToClipboard(selectedJob.connectionNote!)} className="text-blue-600 text-[10px] font-bold hover:underline">COPY</button>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 italic">
                                        {selectedJob.connectionNote || 'Click "AI Generate Outreach" to create a personalized note.'}
                                    </div>
                                </div>

                                {/* Referral LinkedIn */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-widest leading-none">
                                            <i className="fab fa-linkedin text-blue-600"></i> LinkedIn Referral Message
                                        </h4>
                                        {selectedJob.referralLinkedIn && (
                                            <button onClick={() => copyToClipboard(selectedJob.referralLinkedIn!)} className="text-blue-600 text-[10px] font-bold hover:underline">COPY</button>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap italic">
                                        {selectedJob.referralLinkedIn || 'AI messaging for existing connections or cold outreach.'}
                                    </div>
                                </div>

                                {/* Referral Email */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-gray-700 flex items-center gap-2 uppercase text-xs tracking-widest leading-none">
                                            <i className="fas fa-envelope-open-text text-red-400"></i> Professional Referral Email
                                        </h4>
                                        {selectedJob.referralEmail && (
                                            <button onClick={() => copyToClipboard(selectedJob.referralEmail!)} className="text-blue-600 text-[10px] font-bold hover:underline">COPY</button>
                                        )}
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap italic">
                                        {selectedJob.referralEmail || 'Full email body with subject line.'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <i className="fas fa-briefcase text-4xl text-gray-200 mb-4"></i>
                            <p className="text-gray-400 font-bold uppercase text-xs">Select a company to view actions</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
