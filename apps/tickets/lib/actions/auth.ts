"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import type { ActionResponse, User } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { LoginInput } from "@/lib/validations"
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode"
import { getDemoCurrentUser } from "@/lib/mock-data"

const DEMO_USERNAME = process.env.TICKETS_DEMO_USERNAME || "admin"
const DEMO_PASSWORD = process.env.TICKETS_DEMO_PASSWORD || "admin123"
const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "")

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

export async function loginAction(
  data: LoginInput
): Promise<ActionResponse<{ user: User }>> {
  if (isLocalMode()) {
    const identifier = data.identifier.trim().toLowerCase()
    const expectedIdentifier = DEMO_USERNAME.trim().toLowerCase()

    if (identifier !== expectedIdentifier || data.password !== DEMO_PASSWORD) {
      return {
        success: false,
        error: "Credenciales invalidas para modo local",
      }
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
    return {
      success: false,
      error: "No se pudo obtener información del usuario",
    }
  }

  // Obtener datos del perfil del usuario
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .single()

  if (profileError || !profile) {
    return {
      success: false,
      error: "No se encontró el perfil del usuario",
    }
  }

  if (profile.estado !== "activo") {
    await supabase.auth.signOut()
    return {
      success: false,
      error: "Tu cuenta está desactivada. Contacta al administrador.",
    }
  }

  revalidatePath("/", "layout")

  return {
    success: true,
    data: { user: profile as User },
    message: "Inicio de sesión exitoso",
  }
}

export async function logoutAction(): Promise<void> {
  if (isLocalMode()) {
    await clearDemoSessionCookie()
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

export async function getCurrentUser(): Promise<User | null> {
  if (isLocalMode()) {
    const authenticated = await hasDemoSession()
    return authenticated ? getDemoCurrentUser() : null
  }

  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return null
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .single()

  return profile as User | null
}

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
    return {
      success: false,
      error: "Creacion de usuarios no disponible en modo local",
    }
  }

  const supabase = await createClient()

  // Verificar que el usuario actual tenga permisos para crear usuarios
  const currentUser = await getCurrentUser()
  
  if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 3) {
    return {
      success: false,
      error: "No tienes permisos para crear usuarios",
    }
  }

  // Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (authError) {
    return {
      success: false,
      error: authError.message,
    }
  }

  if (!authData.user) {
    return {
      success: false,
      error: "No se pudo crear el usuario",
    }
  }

  // Crear perfil en la tabla users
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
    // Intentar eliminar el usuario de auth si falla la creación del perfil
    await supabase.auth.admin.deleteUser(authData.user.id)
    return {
      success: false,
      error: profileError.message,
    }
  }

  revalidatePath("/dashboard/usuarios")

  return {
    success: true,
    data: { user: profile as User },
    message: "Usuario creado exitosamente",
  }
}

export async function updatePasswordAction(
  userId: string,
  newPassword: string
): Promise<ActionResponse> {
  if (isLocalMode()) {
    return {
      success: false,
      error: "Cambio de contrasena no disponible en modo local",
    }
  }

  const supabase = await createClient()

  const currentUser = await getCurrentUser()
  
  if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 3) {
    return {
      success: false,
      error: "No tienes permisos para cambiar contraseñas",
    }
  }

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Contraseña actualizada exitosamente",
  }
}
