import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore, cleanForFirestore } from "@/lib/firebase/admin"
import {
  BRIDGE_SESSION_COOKIE,
  FIREBASE_BRIDGE_ID_TOKEN_COOKIE,
  FIREBASE_SESSION_COOKIE,
  isFirebaseMode,
} from "@/lib/local-mode"
import { ROLE_HIERARCHY } from "@/types"

const WEB_APP_URL = (process.env.WEB_URL || "https://copselectronics.com").replace(/\/$/, "")

// idToken expires in 1h — keep the cookie a bit shorter to avoid edge cases
const ID_TOKEN_COOKIE_MAX_AGE = 55 * 60

/**
 * GET /auth/firebase-bridge?token=<firebase_id_token>
 *
 * Bridge from the web platform. Accepts a raw Firebase ID Token, verifies it
 * with Firebase Admin SDK (no shared secret needed), ensures the user has a
 * Firestore profile (auto-creating one with role "tecnico" if needed), stores
 * the token in a short-lived httpOnly cookie, and redirects to /dashboard.
 *
 * Why not createSessionCookie(): Firebase requires the idToken to be <5 min old
 * to create a session cookie — too restrictive for a click-based flow. Instead,
 * getCurrentUser() calls auth.verifyIdToken() on every request, which works for
 * the full 1-hour idToken lifetime.
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
    // Local/demo mode — bridge not needed, just go to dashboard
    return NextResponse.redirect(new URL("/dashboard", requestUrl.origin).toString())
  }

  try {
    const auth = getAdminAuth()

    // Verify the Firebase ID token — valid for the full 1-hour lifetime
    let uid: string
    try {
      const decoded = await auth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch (err) {
      console.error("[firebase-bridge] idToken verification failed:", err)
      return errorRedirect("expired")
    }

    const db = getAdminFirestore()
    const userRef = db.collection("users").doc(uid)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      // User authenticated via Firebase Auth but has no Tickets profile yet.
      // Auto-create one with role "tecnico" so they can access the system.
      // The admin can promote them later from /dashboard/usuarios.
      console.log("[firebase-bridge] auto-provisioning Firestore profile for uid:", uid)
      try {
        const authUser = await auth.getUser(uid)
        const displayName = authUser.displayName ?? ""
        const nameParts = displayName.trim().split(" ")
        const nombre = nameParts[0] || authUser.email?.split("@")[0] || uid
        const apellido = nameParts.slice(1).join(" ") || null

        const now = new Date().toISOString()
        const newProfile = cleanForFirestore({
          nombre,
          apellido,
          email: authUser.email ?? "",
          rol: "tecnico",
          nivel_jerarquico: ROLE_HIERARCHY["tecnico"],
          estado: "activo",
          cedula: null,
          telefono: null,
          foto_perfil_path: null,
          especialidad: null,
          activo_desde: now.split("T")[0],
          created_at: now,
          updated_at: now,
        })
        await userRef.set(newProfile)
      } catch (createErr) {
        console.error("[firebase-bridge] failed to auto-create profile:", createErr)
        return errorRedirect("invalid-signature")
      }
    } else {
      // Profile exists — verify it is active
      const userData = userDoc.data() as { estado?: string }
      if (userData?.estado !== "activo") {
        console.error("[firebase-bridge] user account inactive:", uid)
        return errorRedirect("invalid-signature")
      }
    }

    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    }

    const dashboardUrl = new URL("/dashboard", requestUrl.origin)
    const response = NextResponse.redirect(dashboardUrl.toString())

    // Store the raw idToken — getCurrentUser() will verify it with verifyIdToken()
    response.cookies.set(FIREBASE_BRIDGE_ID_TOKEN_COOKIE, idToken, {
      ...cookieOpts,
      maxAge: ID_TOKEN_COOKIE_MAX_AGE,
    })

    // Clear older session cookies so the new user takes effect immediately
    response.cookies.set(FIREBASE_SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 })
    response.cookies.set(BRIDGE_SESSION_COOKIE, "", { ...cookieOpts, maxAge: 0 })

    return response
  } catch (err) {
    console.error("[firebase-bridge] unexpected error:", err)
    return errorRedirect("no_token")
  }
}
