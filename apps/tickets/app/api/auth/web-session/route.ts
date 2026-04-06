import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore, fromFirestoreDoc } from "@/lib/firebase/admin"
import { createTicketsBridgeToken } from "@/lib/platform-bridge"
import { hasFirebaseConfig } from "@/lib/local-mode"
import type { User } from "@/types"

async function resolveIdToken(email?: string, password?: string, idToken?: string): Promise<string | null> {
  if (idToken) return idToken

  // Sign in via Firebase REST API using email/password
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey || !email || !password) return null

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  )
  if (!res.ok) return null
  const body = (await res.json()) as { idToken?: string }
  return body.idToken ?? null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      idToken?: string
      email?: string
      password?: string
    }

    if (!hasFirebaseConfig()) {
      return NextResponse.json({ success: false, error: "Firebase no configurado" }, { status: 500 })
    }

    const token = await resolveIdToken(body.email, body.password, body.idToken)
    if (!token) {
      const code = body.idToken ? "idToken inválido" : "Credenciales inválidas"
      return NextResponse.json({ success: false, error: code }, { status: 401 })
    }

    const auth = getAdminAuth()
    let decoded: { uid: string }
    try {
      decoded = await auth.verifyIdToken(token)
    } catch {
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }

    const uid = decoded.uid
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
    const message = err instanceof Error ? err.message : "Error interno"
    console.error("[web-session]", err)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
