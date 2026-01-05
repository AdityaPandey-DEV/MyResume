import { auth } from 'next-auth'
import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/admin/:path*'],
}

export async function middleware(request: Request) {
  const session = await auth()

  if (!session && !request.url.includes('/admin/login')) {
    return NextResponse.redirect(
      new URL('/admin/login', request.url)
    )
  }

  return NextResponse.next()
}