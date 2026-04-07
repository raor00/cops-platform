import { NextResponse } from "next/server"
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
} from "../../../../lib/masterAuth"

const COOKIE_MAX_AGE = 60 * 60 * 8

// Firebase public config — NEXT_PUBLIC_ vars are client-safe by design
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyCkxGHytPvbd1ZoCXGuLKoS_PW6QkkOnFM"

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Credenciales requeridas" }, { status: 400 })
    }

    // Sign in directly via Firebase Identity Toolkit REST API
    const firebaseRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    )

    if (!firebaseRes.ok) {
      const body = (await firebaseRes.json().catch(() => ({}))) as { error?: { message?: string } }
      const code = body.error?.message ?? ""
      console.error("[session] Firebase sign-in failed:", code)

      if (
        code.includes("INVALID_LOGIN_CREDENTIALS") ||
        code.includes("EMAIL_NOT_FOUND") ||
        code.includes("INVALID_PASSWORD") ||
        code.includes("INVALID_EMAIL")
      ) {
        return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
      }
      if (code.includes("TOO_MANY_ATTEMPTS") || code.includes("USER_DISABLED")) {
        return NextResponse.json({ success: false, error: "Cuenta bloqueada. Contacta a IT." }, { status: 429 })
      }
      return NextResponse.json({ success: false, error: `Error Firebase: ${code || firebaseRes.status}` }, { status: 401 })
    }

    const firebaseData = (await firebaseRes.json()) as { localId: string; idToken: string }
    const { localId: uid, idToken } = firebaseData
    if (!uid) {
      return NextResponse.json({ success: false, error: "Respuesta inválida de Firebase" }, { status: 500 })
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
    response.cookies.set(MASTER_USER_COOKIE, uid, cookieOpts)
    // Save Firebase ID token so /api/bridge can use it for SSO without a shared secret
    if (idToken) {
      response.cookies.set("cops_firebase_id_token", idToken, {
        ...cookieOpts,
        maxAge: 55 * 60, // 55 min — idToken expires in 1h
      })
    }

    return response
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[session] unexpected error:", msg)
    return NextResponse.json({ success: false, error: `Error: ${msg}` }, { status: 500 })
  }
}
