import { NextResponse, type NextRequest } from "next/server"
import {
  BRIDGE_SESSION_COOKIE,
  DEMO_SESSION_COOKIE,
  FIREBASE_SESSION_COOKIE,
  FIREBASE_BRIDGE_ID_TOKEN_COOKIE,
  isFirebaseMode,
  isLocalMode,
} from "@/lib/local-mode"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")
const PUBLIC_PATHS = ["/auth/bridge", "/auth/firebase-bridge", "/login", "/_next", "/favicon", "/api/"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path))
}

function hasCookie(request: NextRequest, name: string): boolean {
  return Boolean(request.cookies.get(name)?.value)
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  if (isLocalMode()) {
    if (hasCookie(request, DEMO_SESSION_COOKIE)) {
      return NextResponse.next({ request })
    }

    const authParam = searchParams.get("auth")
    if (authParam === "1") {
      const cleanUrl = new URL(pathname, request.url)
      const response = NextResponse.redirect(cleanUrl.toString())
      response.cookies.set(DEMO_SESSION_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 12,
      })
      return response
    }

    if (process.env.NODE_ENV === "development") {
      const response = NextResponse.redirect(new URL("/dashboard", request.url))
      response.cookies.set(DEMO_SESSION_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: 60 * 60 * 12,
      })
      return response
    }

    return NextResponse.redirect(WEB_APP_URL + "/panel")
  }

  if (isFirebaseMode()) {
    if (
      hasCookie(request, FIREBASE_SESSION_COOKIE) ||
      hasCookie(request, BRIDGE_SESSION_COOKIE) ||
      hasCookie(request, FIREBASE_BRIDGE_ID_TOKEN_COOKIE)
    ) {
      return NextResponse.next({ request })
    }

    // No standalone login in Firebase mode — send directly to web platform
    return NextResponse.redirect(WEB_APP_URL + "/login")
  }

  return NextResponse.redirect(WEB_APP_URL + "/login")
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
