'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const isVerify = searchParams.get('verify') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await signIn('email', { email, callbackUrl: '/admin' })
    setIsLoading(false)
  }

  if (isVerify) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Check your email</h1>
        <p className="text-gray-600 mb-6">A sign in link has been sent to your email address.</p>
        <Link href="/admin/login" className="text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full text-center">
      <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
      <p className="text-gray-500 mb-6">Device Authentication</p>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="admin@example.com"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Sending Link...' : 'Send Verification Link'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}