import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  DEMO_SESSION_COOKIE,
  hasFirebaseAdminConfig,
  hasFirebaseClientConfig,
  isFirebaseMode,
  isLocalMode,
  resolveTicketsDataMode,
} from "@/lib/local-mode"
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
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
        ? `✓ "${process.env.CLOUDINARY_CLOUD_NAME}"`
        : "❌ NO DEFINIDO",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY
        ? `✓ definido`
        : "❌ NO DEFINIDO",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? `✓ definido`
        : "❌ NO DEFINIDO",
      CLOUDINARY_URL: process.env.CLOUDINARY_URL
        ? `✓ definido`
        : "(no definido)",
      NEXT_PUBLIC_CLOUDINARY_URL: process.env.NEXT_PUBLIC_CLOUDINARY_URL
        ? "✓ definido"
        : "(no definido)",
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        ? `✓ "${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}"`
        : "(no definido)",
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
        ? "✓ definido"
        : "(no definido)",
      WEB_URL: process.env.WEB_URL ?? "(no definido, usando default)",
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
        ? "✓ definido"
        : "(no definido)",
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
        ? "✓ definido"
        : "(no definido)",
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ? "✓ definido"
        : "(no definido)",
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
        ? "✓ definido"
        : "(no definido)",
      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
        ? "✓ definido"
        : "(no definido)",
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
        ? `✓ definido (${process.env.FIREBASE_PRIVATE_KEY.length} chars)`
        : "(no definido)",
    },
    mode: {
      resolved: resolveTicketsDataMode(),
      isLocalMode: isLocalMode(),
      isFirebaseMode: isFirebaseMode(),
      hasFirebaseAdminConfig: hasFirebaseAdminConfig(),
      hasFirebaseClientConfig: hasFirebaseClientConfig(),
    },
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
