import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode"
import { verifyTicketsBridgeToken } from "@/lib/platform-bridge"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(DEMO_SESSION_COOKIE)?.value
  const url = new URL(request.url)
  const testToken = url.searchParams.get("token")

  const info = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      TICKETS_LOCAL_MODE: process.env.TICKETS_LOCAL_MODE ?? "(no definido)",
      NEXT_PUBLIC_TICKETS_LOCAL_MODE: process.env.NEXT_PUBLIC_TICKETS_LOCAL_MODE ?? "(no definido)",
      PLATFORM_TICKETS_BRIDGE_SECRET: process.env.PLATFORM_TICKETS_BRIDGE_SECRET
        ? `✓ definido (${process.env.PLATFORM_TICKETS_BRIDGE_SECRET.length} chars)`
        : "❌ NO DEFINIDO",
      WEB_URL: process.env.WEB_URL ?? "(no definido, usando default)",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✓ definido"
        : "(no definido)",
    },
    isLocalMode: isLocalMode(),
    session: {
      cookie_present: sessionCookie === "1",
      cookie_value: sessionCookie ?? "(vacío)",
    },
    tokenTest: testToken
      ? verifyTicketsBridgeToken(testToken)
      : "(pasa ?token=TU_TOKEN para probar)",
  }

  return NextResponse.json(info, { status: 200 })
}
