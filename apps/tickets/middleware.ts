import { NextResponse, type NextRequest } from "next/server"
import { DEMO_SESSION_COOKIE } from "@/lib/local-mode"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

// Rutas que no requieren autenticación
const PUBLIC_PATHS = ["/auth/bridge", "/login", "/_next", "/favicon", "/api/debug"]

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Siempre dejar pasar rutas públicas
  if (isPublicPath(pathname)) {
    return NextResponse.next({ request })
  }

  // Verificar cookie de sesión bridge (funciona en local y en Vercel)
  const sessionCookie = request.cookies.get(DEMO_SESSION_COOKIE)?.value
  if (sessionCookie === "1") {
    return NextResponse.next({ request })
  }

  // Sin sesión → redirigir al panel web para autenticarse
  return NextResponse.redirect(`${WEB_APP_URL}/panel`)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
