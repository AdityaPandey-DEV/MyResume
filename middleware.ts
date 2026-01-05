import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const runtime = 'nodejs'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Always allow login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // ✅ Only protect /admin root and subroutes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    })

    // 🔴 Redirect ONLY if token is missing
    if (!token) {
      return NextResponse.redirect(
        new URL('/admin/login', req.url)
      )
    }

    // ✅ Token exists → allow access
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}