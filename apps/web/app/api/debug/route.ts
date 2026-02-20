import { NextResponse } from "next/server"
import { getTicketsBridgeSecret, createTicketsBridgeToken } from "../../../lib/ticketsBridge"
import { cookies } from "next/headers"
import { MASTER_SESSION_COOKIE, MASTER_ROLE_COOKIE, MASTER_USER_COOKIE, MASTER_SESSION_VALUE } from "../../../lib/masterAuth"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(MASTER_SESSION_COOKIE)?.value
  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value
  const bridgeSecret = getTicketsBridgeSecret()

  let sampleToken = null
  let tokenError = null
  if (bridgeSecret) {
    try {
      sampleToken = createTicketsBridgeToken({ sub: username || "admin", role: role || "admin" }, bridgeSecret)
    } catch(e: unknown) {
      tokenError = e instanceof Error ? e.message : String(e)
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      PLATFORM_TICKETS_BRIDGE_SECRET: bridgeSecret
        ? "definido (" + bridgeSecret.length + " chars)"
        : "NO DEFINIDO",
      TICKETS_APP_URL: process.env.TICKETS_APP_URL || "(no definido)",
    },
    session: {
      active: session === MASTER_SESSION_VALUE,
      role: role || "(ninguno)",
      username: username || "(ninguno)",
    },
    sampleToken,
    tokenError,
  })
}