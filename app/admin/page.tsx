'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import HeroEditor from '@/components/admin/HeroEditor'
import AboutEditor from '@/components/admin/AboutEditor'
import ProjectsManager from '@/components/admin/ProjectsManager'
import SkillsManager from '@/components/admin/SkillsManager'
import EducationManager from '@/components/admin/EducationManager'
import CertificationsManager from '@/components/admin/CertificationsManager'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/admin/login')
    },
  })

  const [activeTab, setActiveTab] = useState('hero')

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  // session is GUARANTEED here
  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold gradient-text">
            Admin Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'hero' && <HeroEditor />}
            {activeTab === 'about' && <AboutEditor />}
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'skills' && <SkillsManager />}
            {activeTab === 'education' && <EducationManager />}
            {activeTab === 'certifications' && <CertificationsManager />}
          </div>
        </div>
      </div>
    </div>
  )
}