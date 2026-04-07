import { NextResponse } from "next/server"
import {
  BRIDGE_SESSION_COOKIE,
  DEMO_SESSION_COOKIE,
  FIREBASE_SESSION_COOKIE,
  isFirebaseMode,
  isLocalMode,
} from "@/lib/local-mode"
import {
  BRIDGE_TOKEN_COOKIE_MAX_AGE,
  verifyTicketsBridgeToken,
} from "@/lib/platform-bridge"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token = requestUrl.searchParams.get("token")?.trim()
  const localMode = isLocalMode()

  if (!token) {
    return NextResponse.redirect(WEB_APP_URL + "/panel?bridge_error=no_token")
  }

  const verification = verifyTicketsBridgeToken(token)
  if (!verification.valid) {
    const reason = verification.reason
    console.error("[bridge] token verification failed:", reason)
    return NextResponse.redirect(WEB_APP_URL + `/panel?bridge_error=${reason}`)
  }

  const dashboardUrl = new URL("/dashboard", requestUrl.origin)
  const response = NextResponse.redirect(dashboardUrl.toString())

  if (localMode) {
    response.cookies.set(DEMO_SESSION_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: BRIDGE_TOKEN_COOKIE_MAX_AGE,
    })
    return response
  }

  if (isFirebaseMode()) {
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }
    // Clear any existing Firebase session so the bridge user takes effect immediately
    response.cookies.set(FIREBASE_SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 })
    response.cookies.set(BRIDGE_SESSION_COOKIE, token, { ...cookieOpts, maxAge: BRIDGE_TOKEN_COOKIE_MAX_AGE })
    return response
  }

  return NextResponse.redirect(WEB_APP_URL + "/panel")
}
