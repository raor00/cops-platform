import { NextResponse, type NextRequest } from "next/server"
import { DEMO_SESSION_COOKIE } from "@/lib/local-mode"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

const PUBLIC_PATHS = ["/auth/bridge", "/login", "/_next", "/favicon", "/api/"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Rutas públicas siempre pasan
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  // Verificar cookie de sesión existente
  const sessionCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value
  if (sessionCookie === "1") {
    return NextResponse.next({ request })
  }

  // Verificar token de sesión en query param (?auth=1)
  // El web app puede pasar este parámetro para bootstrapear la sesión
  const authParam = searchParams.get("auth")
  if (authParam === "1") {
    // Setear la cookie y redirigir a la misma URL sin el query param
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

  // Sin sesión → redirigir al panel web
  return NextResponse.redirect(WEB_APP_URL + "/panel")
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
