"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, UserProfile, UserUpdateInput, UserRole } from "@/types"
import { getCurrentUser, registerUserAction } from "./auth"
import { ROLE_HIERARCHY } from "@/types"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getAdminFirestore, getAdminStorage, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"
import { getDemoCurrentUser, getDemoUsers } from "@/lib/mock-data"

const BUCKET_NAME = "user-profiles"

async function fbGetUserWithPhoto(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore()
  const doc = await db.collection("users").doc(uid).get()
  if (!doc.exists) return null
  const user = fromFirestoreDoc<UserProfile>(uid, doc.data()!)
  if (user.foto_perfil_path) {
    try {
      const bucket = getAdminStorage().bucket()
      const [url] = await bucket.file(user.foto_perfil_path).getSignedUrl({ action: "read", expires: Date.now() + 3600 * 1000 })
      user.foto_perfil_url = url
    } catch { user.foto_perfil_url = null }
  } else {
    user.foto_perfil_url = null
  }
  return user
}

export async function getAllUsers(): Promise<ActionResponse<UserProfile[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    if (ROLE_HIERARCHY[user.rol] < 3) return { success: false, error: "No tienes permisos para ver usuarios" }

    if (isLocalMode()) {
      const allUsers = getDemoUsers().map((u) => ({ ...u, foto_perfil_url: null }) as UserProfile)
      return { success: true, data: allUsers }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db.collection("users").orderBy("nombre").get()
      const visibleDocs = snap.docs.filter((d) => d.data().hidden !== true)
      const users = await Promise.all(visibleDocs.map((d) => fbGetUserWithPhoto(d.id)))
      return { success: true, data: users.filter(Boolean) as UserProfile[] }
    }

    const supabase = await createClient()
    const { data: users, error } = await supabase.from("users").select("*").order("nombre", { ascending: true })
    if (error) return { success: false, error: `Error al obtener usuarios: ${error.message}` }
    const usersWithUrls = await Promise.all(
      (users || []).map(async (u) => {
        if (u.foto_perfil_path) {
          const { data: signedUrl } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(u.foto_perfil_path, 3600)
          return { ...u, foto_perfil_url: signedUrl?.signedUrl || null } as UserProfile
        }
        return { ...u, foto_perfil_url: null } as UserProfile
      })
    )
    return { success: true, data: usersWithUrls }
  } catch (error) {
    return { success: false, error: "Error inesperado al obtener usuarios" }
  }
}

export async function getUserById(userId: string): Promise<ActionResponse<UserProfile>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    if (user.id !== userId && ROLE_HIERARCHY[user.rol] < 3) return { success: false, error: "Sin permisos" }

    if (isLocalMode()) {
      const demoUser = getDemoUsers().find((u) => u.id === userId) ?? getDemoCurrentUser()
      return { success: true, data: { ...demoUser, foto_perfil_url: null } as UserProfile }
    }

    if (isFirebaseMode()) {
      const profile = await fbGetUserWithPhoto(userId)
      if (!profile) return { success: false, error: "Usuario no encontrado" }
      return { success: true, data: profile }
    }

    const supabase = await createClient()
    const { data: targetUser, error } = await supabase.from("users").select("*").eq("id", userId).single()
    if (error || !targetUser) return { success: false, error: "Usuario no encontrado" }
    let fotoPerfilUrl = null
    if (targetUser.foto_perfil_path) {
      const { data: signedUrl } = await supabase.storage.from(BUCKET_NAME).createSignedUrl(targetUser.foto_perfil_path, 3600)
      fotoPerfilUrl = signedUrl?.signedUrl || null
    }
    return { success: true, data: { ...targetUser, foto_perfil_url: fotoPerfilUrl } as UserProfile }
  } catch (error) {
    return { success: false, error: "Error inesperado al obtener usuario" }
  }
}

export async function updateUserProfile(userId: string, updates: UserUpdateInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    const canUpdate = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3
    if (!canUpdate) return { success: false, error: "No tienes permisos para editar este usuario" }

    if (isLocalMode()) return { success: true, message: "Perfil actualizado (modo local)" }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      await db.collection("users").doc(userId).update(cleanForFirestore({ ...updates, updated_at: new Date().toISOString() }))
      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, message: "Perfil actualizado exitosamente" }
    }

    const supabase = await createClient()
    const { error } = await supabase.from("users").update(updates).eq("id", userId)
    if (error) return { success: false, error: `Error al actualizar perfil: ${error.message}` }
    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)
    return { success: true, message: "Perfil actualizado exitosamente" }
  } catch (error) {
    return { success: false, error: "Error inesperado al actualizar perfil" }
  }
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<ActionResponse<string>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    const canUpload = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3
    if (!canUpload) return { success: false, error: "No tienes permisos para subir foto" }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) return { success: false, error: "Tipo de archivo no permitido. Solo JPEG, PNG o WEBP" }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return { success: false, error: "El archivo es demasiado grande. Maximo 5 MB" }

    if (isLocalMode()) return { success: false, error: "Subida de fotos no disponible en modo local" }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const bucket = getAdminStorage().bucket()
      const timestamp = Date.now()
      const extension = file.name.split(".").pop()
      const filePath = `profile-photos/${userId}/profile-${timestamp}.${extension}`

      const userDoc = await db.collection("users").doc(userId).get()
      if (userDoc.exists) {
        const oldPath = userDoc.data()!.foto_perfil_path as string | null
        if (oldPath) {
          try { await bucket.file(oldPath).delete() } catch {}
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      await bucket.file(filePath).save(buffer, { metadata: { contentType: file.type } })
      await db.collection("users").doc(userId).update({ foto_perfil_path: filePath, updated_at: new Date().toISOString() })

      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, data: filePath, message: "Foto de perfil subida exitosamente" }
    }

    const supabase = await createClient()
    const { data: targetUser } = await supabase.from("users").select("foto_perfil_path").eq("id", userId).single()
    if (targetUser?.foto_perfil_path) await supabase.storage.from(BUCKET_NAME).remove([targetUser.foto_perfil_path])
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const fileName = `${userId}/profile-${timestamp}.${extension}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, { cacheControl: "3600", upsert: true })
    if (uploadError) return { success: false, error: `Error al subir foto: ${uploadError.message}` }
    const { error: dbError } = await supabase.from("users").update({ foto_perfil_path: uploadData.path }).eq("id", userId)
    if (dbError) {
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path])
      return { success: false, error: `Error al actualizar perfil: ${dbError.message}` }
    }
    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)
    return { success: true, data: uploadData.path, message: "Foto de perfil subida exitosamente" }
  } catch (error) {
    return { success: false, error: "Error inesperado al subir foto de perfil" }
  }
}

export async function deleteProfilePhoto(userId: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    const canDelete = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3
    if (!canDelete) return { success: false, error: "No tienes permisos para eliminar esta foto" }

    if (isLocalMode()) return { success: false, error: "No disponible en modo local" }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const doc = await db.collection("users").doc(userId).get()
      if (!doc.exists) return { success: false, error: "Usuario no encontrado" }
      const oldPath = doc.data()!.foto_perfil_path as string | null
      if (oldPath) {
        try { await getAdminStorage().bucket().file(oldPath).delete() } catch {}
      }
      await db.collection("users").doc(userId).update({ foto_perfil_path: null, updated_at: new Date().toISOString() })
      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, message: "Foto de perfil eliminada" }
    }

    const supabase = await createClient()
    const { data: targetUser } = await supabase.from("users").select("foto_perfil_path").eq("id", userId).single()
    if (!targetUser?.foto_perfil_path) return { success: false, error: "No hay foto de perfil para eliminar" }
    await supabase.storage.from(BUCKET_NAME).remove([targetUser.foto_perfil_path])
    await supabase.from("users").update({ foto_perfil_path: null }).eq("id", userId)
    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)
    return { success: true, message: "Foto de perfil eliminada" }
  } catch (error) {
    return { success: false, error: "Error inesperado al eliminar foto" }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER (wrapper for inline creation from ticket form)
// ─────────────────────────────────────────────────────────────────────────────

export async function createUser(input: {
  nombre: string
  apellido?: string
  email: string
  telefono: string
  password: string
  rol: UserRole
  cedula?: string
}): Promise<ActionResponse<{ id: string }>> {
  const result = await registerUserAction({
    nombre: input.nombre,
    apellido: input.apellido ?? "",
    email: input.email,
    telefono: input.telefono,
    password: input.password,
    rol: input.rol,
    cedula: input.cedula ?? "",
  })
  if (!result.success) return { success: false, error: result.error }
  const id = result.data?.user.id ?? ""
  return { success: true, data: { id }, message: result.message }
}
