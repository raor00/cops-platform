import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_ROLE_COOKIE,
  MASTER_USER_COOKIE,
} from "../../../lib/masterAuth"
import { createTicketsBridgeToken, getTicketsBridgeSecret } from "../../../lib/ticketsBridge"
import { getTicketsAppUrl } from "../../../lib/moduleLinks"

export const dynamic = "force-dynamic"

/**
 * GET /api/bridge?module=tickets
 * Generates a fresh bridge token and returns the destination URL.
 * Called by ModuleCardClient at click time so the token is never stale.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies()
  const session = cookieStore.get(MASTER_SESSION_COOKIE)?.value
  if (session !== MASTER_SESSION_VALUE) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value ?? "admin"
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value ?? "admin"

  const { searchParams } = new URL(request.url)
  const module = searchParams.get("module")

  if (module === "tickets") {
    const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "")

    // Prefer Firebase ID Token bridge — no shared secret needed.
    // The idToken is saved at login time (55 min TTL) in cops_firebase_id_token.
    const firebaseIdToken = cookieStore.get("cops_firebase_id_token")?.value?.trim()
    if (firebaseIdToken) {
      const bridgeUrl = new URL("/auth/firebase-bridge", ticketsUrl)
      bridgeUrl.searchParams.set("token", firebaseIdToken)
      return NextResponse.json({ url: bridgeUrl.toString() })
    }

    // Fallback: HMAC bridge token (requires PLATFORM_TICKETS_BRIDGE_SECRET in both apps)
    const bridgeSecret = getTicketsBridgeSecret()
    if (bridgeSecret) {
      const token = createTicketsBridgeToken({ sub: username, role }, bridgeSecret)
      const bridgeUrl = new URL("/auth/bridge", ticketsUrl)
      bridgeUrl.searchParams.set("token", token)
      return NextResponse.json({ url: bridgeUrl.toString() })
    }

    // No SSO configured — send directly, user logs in separately
    return NextResponse.json({ url: ticketsUrl + "/dashboard" })
  }

  return NextResponse.json({ error: "Módulo no reconocido" }, { status: 400 })
}
