import { NextResponse } from "next/server"
import { getAdminAuth, getAdminFirestore, fromFirestoreDoc } from "@/lib/firebase/admin"
import { createTicketsBridgeToken } from "@/lib/platform-bridge"
import { hasFirebaseConfig } from "@/lib/local-mode"
import type { User } from "@/types"

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json() as { idToken: string }
    if (!idToken) {
      return NextResponse.json({ success: false, error: "idToken requerido" }, { status: 400 })
    }

    if (!hasFirebaseConfig()) {
      return NextResponse.json({ success: false, error: "Firebase no configurado" }, { status: 500 })
    }

    const auth = getAdminAuth()
    const decoded = await auth.verifyIdToken(idToken)
    const uid = decoded.uid

    const db = getAdminFirestore()
    const userDoc = await db.collection("users").doc(uid).get()
    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado en el sistema" }, { status: 401 })
    }

    const user = fromFirestoreDoc<User>(uid, userDoc.data()!)
    if (user.estado !== "activo") {
      return NextResponse.json({ success: false, error: "Cuenta desactivada" }, { status: 401 })
    }

    const secret = process.env.PLATFORM_TICKETS_BRIDGE_SECRET?.trim()
    if (!secret || secret.length < 16) {
      return NextResponse.json({ success: false, error: "Bridge secret no configurado" }, { status: 500 })
    }

    const bridgeToken = createTicketsBridgeToken({ sub: uid, role: user.rol }, secret)

    return NextResponse.json({ success: true, bridgeToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al verificar credenciales"
    return NextResponse.json({ success: false, error: message }, { status: 401 })
  }
}
