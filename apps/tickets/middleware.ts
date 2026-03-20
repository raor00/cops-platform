import { NextResponse, type NextRequest } from "next/server"
import { DEMO_SESSION_COOKIE } from "@/lib/local-mode"
import { updateSession } from "@/lib/supabase/middleware"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

const PUBLIC_PATHS = ["/auth/bridge", "/login", "/_next", "/favicon", "/api/"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

const isLocalMode =
  process.env.TICKETS_LOCAL_MODE === "true" ||
  process.env.NEXT_PUBLIC_TICKETS_LOCAL_MODE === "true" ||
  (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Rutas públicas siempre pasan
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  // ── Modo local/demo ──────────────────────────────────────────────────────────
  if (isLocalMode) {
    // Verificar cookie de sesión demo existente
    const sessionCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value
    if (sessionCookie === "1") {
      return NextResponse.next({ request })
    }

    // Verificar token de sesión en query param (?auth=1)
    const authParam = searchParams.get("auth")
    if (authParam === "1") {
      const cleanUrl = new URL(pathname, request.url)
      const response = NextResponse.redirect(cleanUrl.toString())
      response.cookies.set(DEMO_SESSION_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 12,
      })
      return response
    }

    // En desarrollo local sin sesión, auto-autenticar
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

  // ── Modo Supabase (producción) ────────────────────────────────────────────────
  // updateSession refresca el token y redirige al login si no hay sesión activa
  return updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
