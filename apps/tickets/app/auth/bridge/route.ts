import { NextResponse } from "next/server"
import {
  BRIDGE_SESSION_COOKIE,
  DEMO_SESSION_COOKIE,
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
    return NextResponse.redirect(WEB_APP_URL + "/panel")
  }

  const verification = verifyTicketsBridgeToken(token)
  if (!verification.valid) {
    return NextResponse.redirect(WEB_APP_URL + "/panel")
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
    response.cookies.set(BRIDGE_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: BRIDGE_TOKEN_COOKIE_MAX_AGE,
    })
    return response
  }

  return NextResponse.redirect(WEB_APP_URL + "/panel")
}
