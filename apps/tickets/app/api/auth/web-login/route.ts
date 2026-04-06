import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore, fromFirestoreDoc } from "@/lib/firebase/admin"
import { createTicketsBridgeToken } from "@/lib/platform-bridge"
import { hasFirebaseConfig } from "@/lib/local-mode"
import type { User } from "@/types"

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email: string; password: string }
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Credenciales requeridas" }, { status: 400 })
    }

    if (!hasFirebaseConfig()) {
      return NextResponse.json({ success: false, error: "Firebase no configurado en el servidor" }, { status: 500 })
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Firebase API key no configurada" }, { status: 500 })
    }

    // Sign in via Firebase REST API (no client SDK needed on caller side)
    const signInRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    )

    if (!signInRes.ok) {
      const body = (await signInRes.json()) as { error?: { message?: string } }
      const code = body.error?.message ?? ""
      if (
        code.includes("INVALID_LOGIN_CREDENTIALS") ||
        code.includes("EMAIL_NOT_FOUND") ||
        code.includes("INVALID_PASSWORD") ||
        code.includes("INVALID_EMAIL")
      ) {
        return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
      }
      if (code.includes("TOO_MANY_ATTEMPTS") || code.includes("USER_DISABLED")) {
        return NextResponse.json(
          { success: false, error: "Cuenta bloqueada. Contacta a IT." },
          { status: 429 }
        )
      }
      return NextResponse.json({ success: false, error: "Error al autenticar" }, { status: 401 })
    }

    const { idToken } = (await signInRes.json()) as { idToken: string }

    // Verify with Admin SDK
    const auth = getAdminAuth()
    const decoded = await auth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Look up user in Firestore
    const db = getAdminFirestore()
    const userDoc = await db.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado en el sistema" }, { status: 401 })
    }

    const user = fromFirestoreDoc<User>(uid, userDoc.data()!)
    if (user.estado !== "activo") {
      return NextResponse.json({ success: false, error: "Cuenta desactivada. Contacta a IT." }, { status: 401 })
    }

    const secret = process.env.PLATFORM_TICKETS_BRIDGE_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return NextResponse.json({ success: false, error: "Bridge secret no configurado" }, { status: 500 })
    }

    const bridgeToken = createTicketsBridgeToken({ sub: uid, role: user.rol }, secret)
    return NextResponse.json({ success: true, bridgeToken })
  } catch (err) {
    console.error("[web-login]", err)
    const message = err instanceof Error ? err.message : "Error interno"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
