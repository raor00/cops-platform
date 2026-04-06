import { NextResponse } from "next/server"
import {
  createTicketsBridgeToken,
  getTicketsBridgeSecret,
} from "../../../lib/ticketsBridge"
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
} from "../../../lib/masterAuth"

const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 horas

function verifyIncomingToken(token: string, secret: string): { sub: string; role: string } | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const { createHmac, timingSafeEqual } = require("crypto") as typeof import("crypto")
    const unsigned = `${parts[0]}.${parts[1]}`
    const expected = createHmac("sha256", secret).update(unsigned).digest("base64url")

    const a = Buffer.from(parts[2])
    const b = Buffer.from(expected)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp <= now) return null

    return { sub: payload.sub as string, role: payload.role as string }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")?.trim()
  const panelUrl = new URL("/panel", url.origin).toString()

  if (!token) return NextResponse.redirect(panelUrl)

  const secret = getTicketsBridgeSecret()
  if (!secret) return NextResponse.redirect(panelUrl)

  const payload = verifyIncomingToken(token, secret)
  if (!payload) return NextResponse.redirect(panelUrl)

  const response = NextResponse.redirect(panelUrl)

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  }

  response.cookies.set(MASTER_SESSION_COOKIE, MASTER_SESSION_VALUE, cookieOpts)
  response.cookies.set(MASTER_ROLE_COOKIE, payload.role, cookieOpts)
  response.cookies.set(MASTER_USER_COOKIE, payload.sub, cookieOpts)

  return response
}
