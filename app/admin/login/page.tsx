'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 to-indigo-800">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">
          Admin Login
        </h1>

        <button
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          className="w-full flex items-center justify-center gap-3 bg-white border px-4 py-2 rounded shadow hover:bg-gray-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-5 h-5"
            alt="Google"
          />
          Sign in with Google
        </button>

        <div className="mt-6">
          <Link href="/" className="text-blue-600 text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}