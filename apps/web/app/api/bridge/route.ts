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

const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCkxGHytPvbd1ZoCXGuLKoS_PW6QkkOnFM"

/**
 * Exchanges a Firebase refresh token for a fresh ID token.
 * Firebase ID tokens expire in 1h; this lets us always get a valid one
 * without requiring the user to re-login.
 */
async function refreshFirebaseIdToken(refreshToken: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    )
    if (!res.ok) {
      console.error("[bridge] token refresh failed:", res.status)
      return null
    }
    const data = (await res.json()) as { id_token?: string; refresh_token?: string }
    return data.id_token ?? null
  } catch (err) {
    console.error("[bridge] token refresh error:", err)
    return null
  }
}

/**
 * GET /api/bridge?module=tickets
 * Generates a fresh bridge URL and returns it.
 * Called by ModuleCardClient at click time so the token is never stale.
 *
 * Authentication priority:
 * 1. cops_firebase_id_token cookie (set at login, valid 55 min)
 * 2. cops_firebase_refresh_token cookie (exchange for fresh idToken)
 * 3. HMAC bridge token (fallback — requires PLATFORM_TICKETS_BRIDGE_SECRET)
 * 4. Direct URL (no SSO — user logs in separately)
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

    // ── Priority 1: cached idToken (fresh from login, valid ~55 min) ──────────
    let firebaseIdToken = cookieStore.get("cops_firebase_id_token")?.value?.trim()

    // ── Priority 2: refresh token → get a new idToken ─────────────────────────
    if (!firebaseIdToken) {
      const refreshToken = cookieStore.get("cops_firebase_refresh_token")?.value?.trim()
      if (refreshToken) {
        firebaseIdToken = (await refreshFirebaseIdToken(refreshToken)) ?? undefined
      }
    }

    // ── Use Firebase ID Token bridge (no shared secret needed) ────────────────
    if (firebaseIdToken) {
      const bridgeUrl = new URL("/auth/firebase-bridge", ticketsUrl)
      bridgeUrl.searchParams.set("token", firebaseIdToken)
      return NextResponse.json({ url: bridgeUrl.toString() })
    }

    // ── Priority 3: HMAC bridge (fallback — requires matching secret in both apps)
    const bridgeSecret = getTicketsBridgeSecret()
    if (bridgeSecret) {
      const token = createTicketsBridgeToken({ sub: username, role }, bridgeSecret)
      const bridgeUrl = new URL("/auth/bridge", ticketsUrl)
      bridgeUrl.searchParams.set("token", token)
      return NextResponse.json({ url: bridgeUrl.toString() })
    }

    // ── Priority 4: direct URL (no SSO — user logs in separately) ────────────
    return NextResponse.json({ url: ticketsUrl + "/dashboard" })
  }

  return NextResponse.json({ error: "Módulo no reconocido" }, { status: 400 })
}
