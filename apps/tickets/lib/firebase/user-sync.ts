import type { User } from "@/types"
import { ROLE_HIERARCHY } from "@/types"

export function normalizeEmail(email?: string | null): string {
  return email?.trim().toLowerCase() || ""
}

export function normalizeFirebaseUser(uid: string, rawUser: Partial<User> & { email?: string | null }): User {
  const safeEmail = normalizeEmail(rawUser.email)
  const fallbackName = safeEmail.split("@")[0]?.trim() || "Usuario"

  return {
    id: uid,
    email: safeEmail,
    nombre: rawUser.nombre?.trim() || fallbackName,
    apellido: rawUser.apellido?.trim() || "",
    rol: rawUser.rol || "tecnico",
    nivel_jerarquico: rawUser.nivel_jerarquico ?? ROLE_HIERARCHY[rawUser.rol || "tecnico"],
    telefono: rawUser.telefono ?? null,
    cedula: rawUser.cedula ?? "",
    estado: rawUser.estado || "activo",
    activo_desde: rawUser.activo_desde ?? null,
    foto_perfil_path: rawUser.foto_perfil_path ?? null,
    especialidad: rawUser.especialidad ?? null,
    cargo: rawUser.cargo ?? null,
    created_at: rawUser.created_at || new Date().toISOString(),
    updated_at: rawUser.updated_at || new Date().toISOString(),
  }
}

export function getFirebaseAdminErrorMessage(error: unknown, fallback: string): string {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : ""
  const message = error instanceof Error ? error.message : fallback

  if (code.includes("auth/email-already-exists")) {
    return "Ya existe un usuario autenticable con ese correo"
  }

  if (code.includes("auth/user-not-found")) {
    return "El usuario autenticable no existe en Firebase Auth"
  }

  if (code.includes("auth/invalid-password") || code.includes("auth/weak-password")) {
    return "La contraseña no cumple con los requisitos mínimos de Firebase"
  }

  if (code.includes("auth/invalid-email")) {
    return "El correo electrónico no es válido"
  }

  if (code.includes("auth/email-already-in-use")) {
    return "Ese correo ya está en uso por otro usuario"
  }

  return message || fallback
}
