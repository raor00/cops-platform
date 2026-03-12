"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { ActionResponse, User } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { LoginInput } from "@/lib/validations"
import { DEMO_SESSION_COOKIE, isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getDemoCurrentUser } from "@/lib/mock-data"

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

  // ── Supabase mode ────────────────────────────────────────────────────────────
  const identifier = data.identifier.trim()
  if (!identifier.includes("@")) {
    return {
      success: false,
      error: "En modo productivo debes iniciar sesion con tu correo",
    }
  }

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: identifier,
    password: data.password,
  })

  if (authError) {
    return {
      success: false,
      error: authError.message === "Invalid login credentials"
        ? "Credenciales inválidas"
        : authError.message,
    }
  }

  if (!authData.user) {
    return { success: false, error: "No se pudo obtener información del usuario" }
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "No se encontró el perfil del usuario" }
  }

  if (profile.estado !== "activo") {
    await supabase.auth.signOut()
    return { success: false, error: "Tu cuenta está desactivada. Contacta al administrador." }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: { user: profile as User },
    message: "Inicio de sesión exitoso",
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
    revalidatePath("/", "layout")
    redirect(`${WEB_APP_URL}/`)
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect(`${WEB_APP_URL}/`)
}

export async function logout(): Promise<void> {
  await logoutAction()
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
      const uid = await verifyFirebaseSession()
      if (!uid) return null

      const db = getAdminFirestore()
      const userDoc = await db.collection("users").doc(uid).get()
      if (!userDoc.exists) return null

      return fromFirestoreDoc<User>(uid, userDoc.data()!)
    } catch {
      return null
    }
  }

  // ── Supabase mode ────────────────────────────────────────────────────────────
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single()

  return profile as User | null
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

  // ── Supabase mode ────────────────────────────────────────────────────────────
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) return { success: false, error: authError.message }
  if (!authData.user) return { success: false, error: "No se pudo crear el usuario" }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .insert({
      id: authData.user.id,
      email: data.email,
      nombre: data.nombre,
      apellido: data.apellido,
      rol: data.rol,
      nivel_jerarquico: ROLE_HIERARCHY[data.rol as keyof typeof ROLE_HIERARCHY],
      cedula: data.cedula,
      telefono: data.telefono || null,
      estado: "activo",
    })
    .select()
    .single()

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: profileError.message }
  }

  revalidatePath("/dashboard/usuarios")

  return {
    success: true,
    data: { user: profile as User },
    message: "Usuario creado exitosamente",
  }
}

// ─── Update password ──────────────────────────────────────────────────────────

export async function updatePasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResponse> {
  if (isLocalMode()) {
    return { success: false, error: "Cambio de contrasena no disponible en modo local" }
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

  // ── Supabase mode ────────────────────────────────────────────────────────────
  const supabase = await createClient()
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { success: false, error: error.message }

  return { success: true, message: "Contraseña actualizada exitosamente" }
}
