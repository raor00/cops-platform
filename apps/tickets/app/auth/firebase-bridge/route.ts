import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin"
import {
  BRIDGE_SESSION_COOKIE,
  FIREBASE_SESSION_COOKIE,
  isFirebaseMode,
} from "@/lib/local-mode"

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * GET /auth/firebase-bridge?token=<firebase_id_token>
 *
 * Bridge endpoint that accepts a Firebase ID Token from the web platform.
 * Verifies the token with Firebase Admin SDK, checks the user exists and is
 * active, creates a long-lived Firebase session cookie, and redirects to
 * the dashboard. No shared secret required.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const idToken = requestUrl.searchParams.get("token")?.trim()

  const errorRedirect = (reason: string) =>
    NextResponse.redirect(WEB_APP_URL + `/panel?bridge_error=${reason}`)

  if (!idToken) {
    return errorRedirect("no_token")
  }

  if (!isFirebaseMode()) {
    // Local/demo mode: just redirect to dashboard without a session check
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin).toString())
  }

  try {
    const auth = getAdminAuth()

    // Verify the Firebase ID token (checks signature + expiry)
    let uid: string
    try {
      const decoded = await auth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      console.error("[firebase-bridge] invalid or expired idToken")
      return errorRedirect("expired")
    }

    // Ensure user has a profile in Firestore
    const db = getAdminFirestore()
    const userDoc = await db.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      console.error("[firebase-bridge] user not found in Firestore:", uid)
      return errorRedirect("invalid-signature")
    }

    const userData = userDoc.data() as { estado?: string }
    if (userData?.estado !== "activo") {
      console.error("[firebase-bridge] user account inactive:", uid)
      return errorRedirect("invalid-signature")
    }

    // Create a long-lived Firebase session cookie (7 days)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE * 1000, // ms
    })

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }

    const dashboardUrl = new URL("/dashboard", requestUrl.origin)
    const response = NextResponse.redirect(dashboardUrl.toString())

    // Set long-lived Firebase session
    response.cookies.set(FIREBASE_SESSION_COOKIE, sessionCookie, {
      ...cookieOpts,
      maxAge: SESSION_MAX_AGE,
    })

    // Clear any stale bridge token (prefer the Firebase session going forward)
    response.cookies.set(BRIDGE_SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 })

    return response
  } catch (err) {
    console.error("[firebase-bridge] unexpected error:", err)
    return errorRedirect("no_token")
  }
}
