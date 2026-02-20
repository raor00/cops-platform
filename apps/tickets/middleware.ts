import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from '@/lib/supabase/middleware'
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

export async function middleware(request: NextRequest) {
  if (isLocalMode()) {
    const publicRoutes = ["/auth/bridge"]
    const isPublicRoute = publicRoutes.some((route) =>
      request.nextUrl.pathname.startsWith(route)
    )
    const hasDemoSession = request.cookies.get(DEMO_SESSION_COOKIE)?.value === "1"

    if (!hasDemoSession && !isPublicRoute) {
      return NextResponse.redirect(`${WEB_APP_URL}/login`)
    }

    if (hasDemoSession && request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    return NextResponse.next({ request })
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
