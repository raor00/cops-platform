import { NextResponse } from "next/server"
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
} from "../../../../lib/masterAuth"
import { getTicketsAppUrl } from "../../../../lib/moduleLinks"
import { getTicketsBridgeSecret } from "../../../../lib/ticketsBridge"

const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

function verifyBridgeToken(token: string, secret: string): { sub: string; role: string } | null {
  try {
    const { createHmac, timingSafeEqual } = require("crypto") as typeof import("crypto")
    const parts = token.split(".")
    if (parts.length !== 3) return null

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

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Credenciales requeridas" }, { status: 400 })
    }

    // Delegate authentication to tickets (which has Firebase Admin)
    const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "")
    const res = await fetch(`${ticketsUrl}/api/auth/web-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = (await res.json()) as { success: boolean; bridgeToken?: string; error?: string }
    if (!data.success || !data.bridgeToken) {
      return NextResponse.json(
        { success: false, error: data.error ?? "Credenciales inválidas" },
        { status: res.status === 429 ? 429 : 401 }
      )
    }

    // Verify bridge token signature
    const secret = getTicketsBridgeSecret()
    if (!secret) {
      return NextResponse.json({ success: false, error: "Bridge secret no configurado" }, { status: 500 })
    }

    const payload = verifyBridgeToken(data.bridgeToken, secret)
    if (!payload) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    }

    response.cookies.set(MASTER_SESSION_COOKIE, MASTER_SESSION_VALUE, cookieOpts)
    response.cookies.set(MASTER_ROLE_COOKIE, "admin", cookieOpts)
    response.cookies.set(MASTER_USER_COOKIE, payload.sub, cookieOpts)

    return response
  } catch (err) {
    console.error("[session]", err)
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
  }
}
