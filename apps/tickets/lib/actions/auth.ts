"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { ActionResponse, User } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { LoginInput } from "@/lib/validations"
import {
  BRIDGE_SESSION_COOKIE,
  DEMO_SESSION_COOKIE,
  FIREBASE_BRIDGE_ID_TOKEN_COOKIE,
  getMissingFirebaseEnvKeys,
  hasFirebaseConfig,
  isLocalMode,
  isFirebaseMode,
} from "@/lib/local-mode"
import { getDemoCurrentUser } from "@/lib/mock-data"
import { verifyTicketsBridgeToken, createTicketsBridgeToken } from "@/lib/platform-bridge"

// Firebase imports (only used when isFirebaseMode() is true)
import { getAdminAuth, getAdminFirestore, fromFirestoreDoc } from "@/lib/firebase/admin"
import {
  createFirebaseSession,
  verifyFirebaseSession,
  clearFirebaseSession,
} from "@/lib/firebase/session"

const DEMO_USERNAME = process.env.TICKETS_DEMO_USERNAME || "admin"
const DEMO_PASSWORD = process.env.TICKETS_DEMO_PASSWORD || "admin123"
const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

// ─── Demo session helpers ──────────────────────────────────────────────────────

async function setDemoSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
}

async function clearDemoSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(DEMO_SESSION_COOKIE)
}

async function hasDemoSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(DEMO_SESSION_COOKIE)?.value === "1"
}

async function clearBridgeSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(BRIDGE_SESSION_COOKIE)
  cookieStore.delete(FIREBASE_BRIDGE_ID_TOKEN_COOKIE)
}

async function getBridgeSessionUid(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(BRIDGE_SESSION_COOKIE)?.value?.trim()

  if (!token) return null

  // skipExpiry: the cookie maxAge (12h) controls session lifetime, not the JWT exp (90s transit TTL)
  const verification = verifyTicketsBridgeToken(token, { skipExpiry: true })
  if (!verification.valid) {
    cookieStore.delete(BRIDGE_SESSION_COOKIE)
    return null
  }

  return verification.payload.sub
}

/**
 * Verifies the Firebase ID Token stored by /auth/firebase-bridge.
 * This token is the raw Firebase idToken (valid for 1 hour) — no shared secret needed.
 */
async function getFirebaseBridgeIdTokenUid(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const idToken = cookieStore.get(FIREBASE_BRIDGE_ID_TOKEN_COOKIE)?.value?.trim()
    if (!idToken) return null

    const auth = getAdminAuth()
    const decoded = await auth.verifyIdToken(idToken)
    return decoded.uid
  } catch {
    // Token expired or invalid — middleware will handle cleanup on next navigation
    return null
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  data: LoginInput
): Promise<ActionResponse<{ user: User }>> {
  // ── Local/demo mode ──────────────────────────────────────────────────────────
  if (isLocalMode()) {
    const identifier = data.identifier.trim().toLowerCase()
    const expectedIdentifier = DEMO_USERNAME.trim().toLowerCase()

    if (identifier !== expectedIdentifier || data.password !== DEMO_PASSWORD) {
      return { success: false, error: "Credenciales invalidas para modo local" }
    }

    await setDemoSessionCookie()
    const user = getDemoCurrentUser()
    revalidatePath("/", "layout")

    return {
      success: true,
      data: { user },
      message: "Inicio de sesion local exitoso",
    }
  }

  // ── Firebase mode ────────────────────────────────────────────────────────────
  if (isFirebaseMode()) {
    // The client-side FirebaseLoginForm handles signInWithEmailAndPassword,
    // then calls setFirebaseSessionAction with the resulting ID token.
    // This branch is only reached by that server action, not directly from the form.
    return {
      success: false,
      error: "Usa el formulario de Firebase para iniciar sesión",
    }
  }

  return {
    success: false,
    error: "El módulo opera con Firebase Auth. Usa el formulario de Firebase para iniciar sesión.",
  }
}

/**
 * Called by FirebaseLoginForm after the client completes signInWithEmailAndPassword.
 * Receives the Firebase ID token and creates a server-side session cookie.
 */
export async function setFirebaseSessionAction(
  idToken: string
): Promise<ActionResponse<{ user: User }>> {
  try {
    if (!hasFirebaseConfig()) {
      return {
        success: false,
        error: `Firebase no está configurado completamente. Faltan: ${getMissingFirebaseEnvKeys().join(", ")}`,
      }
    }

    const auth = getAdminAuth()

    // Verify the ID token
    const decoded = await auth.verifyIdToken(idToken)
    const uid = decoded.uid

    // Load user profile from Firestore
    const db = getAdminFirestore()
    const userDoc = await db.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return { success: false, error: "Perfil de usuario no encontrado en el sistema" }
    }

    const user = fromFirestoreDoc<User>(uid, userDoc.data()!)

    if (user.estado !== "activo") {
      return { success: false, error: "Tu cuenta está desactivada. Contacta al administrador." }
    }

    // Create long-lived session cookie
    await createFirebaseSession(idToken)
    revalidatePath("/", "layout")

    return {
      success: true,
      data: { user },
      message: "Inicio de sesión exitoso",
    }
  } catch (err) {
    console.error("[firebase] setFirebaseSessionAction error:", err)
    return { success: false, error: "Error al verificar credenciales Firebase" }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  if (isLocalMode()) {
    await clearDemoSessionCookie()
    revalidatePath("/", "layout")
    redirect(`${WEB_APP_URL}/`)
  }

  if (isFirebaseMode()) {
    await clearFirebaseSession()
    await clearBridgeSessionCookie()
    revalidatePath("/", "layout")
    redirect(`${WEB_APP_URL}/`)
  }

  revalidatePath("/", "layout")
  redirect(`${WEB_APP_URL}/`)
}

export async function logout(): Promise<void> {
  await logoutAction()
}

// ─── Web Bridge Redirect ──────────────────────────────────────────────────────

export async function createWebBridgeRedirectAction(): Promise<ActionResponse<{ url: string }>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }

    const secret = process.env.PLATFORM_TICKETS_BRIDGE_SECRET?.trim()
    if (!secret || secret.length < 16) return { success: false, error: "Bridge secret no configurado" }

    const token = createTicketsBridgeToken({ sub: user.id, role: user.rol }, secret)
    const webUrl = WEB_APP_URL
    const callbackUrl = new URL("/auth/callback", webUrl)
    callbackUrl.searchParams.set("token", token)

    return { success: true, data: { url: callbackUrl.toString() } }
  } catch {
    return { success: false, error: "Error al generar token de bridge" }
  }
}

// ─── Get current user ─────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<User | null> {
  // ── Local mode ───────────────────────────────────────────────────────────────
  if (isLocalMode()) {
    const authenticated = await hasDemoSession()
    return authenticated ? getDemoCurrentUser() : null
  }

  // ── Firebase mode ────────────────────────────────────────────────────────────
  if (isFirebaseMode()) {
    try {
      // Priority order:
      // 1. Firebase ID Token bridge (web platform SSO — no shared secret)
      // 2. HMAC bridge token (legacy SSO — requires shared secret)
      // 3. Firebase session cookie (direct login to tickets)
      const uid =
        (await getFirebaseBridgeIdTokenUid()) ??
        (await getBridgeSessionUid()) ??
        (await verifyFirebaseSession())
      if (!uid) return null

      const db = getAdminFirestore()
      const userDoc = await db.collection("users").doc(uid).get()
      if (!userDoc.exists) return null

      return fromFirestoreDoc<User>(uid, userDoc.data()!)
    } catch {
      return null
    }
  }

  return null
}

// ─── Register user ────────────────────────────────────────────────────────────

export async function registerUserAction(data: {
  email: string
  password: string
  nombre: string
  apellido: string
  rol: string
  cedula: string
  telefono?: string
}): Promise<ActionResponse<{ user: User }>> {
  if (isLocalMode()) {
    return { success: false, error: "Creacion de usuarios no disponible en modo local" }
  }

  const currentUser = await getCurrentUser()
  if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { success: false, error: "No tienes permisos para crear usuarios" }
  }

  // ── Firebase mode ────────────────────────────────────────────────────────────
  if (isFirebaseMode()) {
    if (!hasFirebaseConfig()) {
      return {
        success: false,
        error: `Firebase no está configurado completamente. Faltan: ${getMissingFirebaseEnvKeys().join(", ")}`,
      }
    }

    try {
      const auth = getAdminAuth()
      const db = getAdminFirestore()

      const authUser = await auth.createUser({
        email: data.email,
        password: data.password,
        emailVerified: true,
      })

      const profile: Omit<User, "id"> = {
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: data.rol as User["rol"],
        nivel_jerarquico: ROLE_HIERARCHY[data.rol as keyof typeof ROLE_HIERARCHY],
        cedula: data.cedula,
        telefono: data.telefono || null,
        estado: "activo",
        activo_desde: new Date().toISOString().split("T")[0],
        foto_perfil_path: null,
        especialidad: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      await db.collection("users").doc(authUser.uid).set(profile)

      revalidatePath("/dashboard/usuarios")

      return {
        success: true,
        data: { user: { id: authUser.uid, ...profile } },
        message: "Usuario creado exitosamente",
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al crear usuario"
      return { success: false, error: msg }
    }
  }

  return { success: false, error: "La creación de usuarios requiere configuración Firebase válida" }
}

// ─── Update password ──────────────────────────────────────────────────────────

export async function updatePasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResponse> {
  if (isLocalMode()) {
    return { success: false, error: "Cambio de contrasena no disponible en modo local" }
  }

  if (isFirebaseMode() && !hasFirebaseConfig()) {
    return {
      success: false,
      error: `Firebase no está configurado completamente. Faltan: ${getMissingFirebaseEnvKeys().join(", ")}`,
    }
  }

  const currentUser = await getCurrentUser()
  if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { success: false, error: "No tienes permisos para cambiar contraseñas" }
  }

  // ── Firebase mode ────────────────────────────────────────────────────────────
  if (isFirebaseMode()) {
    try {
      const auth = getAdminAuth()
      await auth.updateUser(userId, { password: newPassword })
      return { success: true, message: "Contraseña actualizada exitosamente" }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al actualizar contraseña"
      return { success: false, error: msg }
    }
  }

  return { success: false, error: "La actualización de contraseñas requiere configuración Firebase válida" }
}
