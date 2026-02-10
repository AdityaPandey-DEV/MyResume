
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        }),
    ],
    session: {
        strategy: 'database',
        maxAge: 30 * 24 * 60 * 60, // 30 Days
    },
    pages: {
        signIn: '/admin/login',
        verifyRequest: '/admin/login?verify=true',
    },
    callbacks: {
        async signIn({ user }) {
            // Strict check: Only allow the Admin Email
            if (user.email === process.env.ADMIN_EMAIL) {
                return true
            }
            return false // Deny everyone else
        },
        async session({ session, user }: any) {
            if (session.user) {
                session.user.id = user.id
            }
            return session
        },
    },
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    trustHost: true,
})
