import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined

        if (!email || !password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/admin/login',
  },

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) token.id = user.id
      return token
    },

    async session({ session, token }: any) {
      if (session.user && token.id) {
        session.user.id = token.id
      }
      return session
    },
  },

  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
})

export async function GET(req: NextRequest) {
  return handler.handlers.GET(req)
}

export async function POST(req: NextRequest) {
  return handler.handlers.POST(req)
}