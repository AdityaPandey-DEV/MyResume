import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const adminEmail = process.env.ADMIN_EMAIL
    const isLoggedIn = !!req.auth
    const isAuthorized = req.auth?.user?.email === adminEmail

    // Protect all /admin routes except /admin/login
    if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
        if (!isLoggedIn || !isAuthorized) {
            // Redirect to home page as requested
            return NextResponse.redirect(new URL("/", req.nextUrl))
        }
    }
})

// Match all admin routes
export const config = {
    matcher: ["/admin/:path*"],
}
