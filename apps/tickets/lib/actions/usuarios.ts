"use server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, UserProfile, UserUpdateInput, UserRole } from "@/types"
import { getCurrentUser, registerUserAction } from "./auth"
import { canEditUserProfile, hasPermission, isDeveloperUser, ROLE_HIERARCHY } from "@/types"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getAdminAuth, getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"
import { uploadFileToStorage, getSignedDownloadUrl, deleteFileFromStorage } from "@/lib/firebase/storage-rest"
import { getDemoCurrentUser, getDemoUsers, updateDemoUser } from "@/lib/mock-data"
import { notifyAdministrativeUserEvent } from "./notificaciones"

function normalizeEmail(email?: string | null): string {
  return email?.trim().toLowerCase() || ""
}

function scoreUserProfile(user: UserProfile): number {
  let score = 0
  if (user.estado === "activo") score += 4
  if (user.nombre?.trim()) score += 2
  if (user.apellido?.trim()) score += 2
  if (user.cedula?.trim()) score += 1
  if (user.telefono?.trim()) score += 1
  if (user.created_at) score += 1
  return score
}

async function fbGetUserWithPhoto(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore()
  const doc = await db.collection("users").doc(uid).get()
  if (!doc.exists) return null
  if (doc.data()?.hidden === true) return null
  const user = fromFirestoreDoc<UserProfile>(uid, doc.data()!)
  if (user.foto_perfil_path) {
    try {
      user.foto_perfil_url = await getSignedDownloadUrl(user.foto_perfil_path)
    } catch { user.foto_perfil_url = null }
  } else {
    user.foto_perfil_url = null
  }
  return user
}

async function fbGetCanonicalUsers(): Promise<UserProfile[]> {
  const db = getAdminFirestore()
  const auth = getAdminAuth()
  const snap = await db.collection("users").orderBy("nombre").get()
  const visibleDocs = snap.docs.filter((d) => d.data().hidden !== true)
  const users = (await Promise.all(visibleDocs.map((d) => fbGetUserWithPhoto(d.id)))).filter(Boolean) as UserProfile[]

  const grouped = new Map<string, UserProfile[]>()
  for (const user of users) {
    const key = normalizeEmail(user.email) || user.id
    grouped.set(key, [...(grouped.get(key) || []), user])
  }

  const canonicalUsers = await Promise.all(
    Array.from(grouped.entries()).map(async ([email, group]) => {
      if (group.length === 1 || !email.includes("@")) return group[0]!

      try {
        const authUser = await auth.getUserByEmail(email)
        const authMatch = group.find((candidate) => candidate.id === authUser.uid)
        if (authMatch) return authMatch
      } catch {
        // ignore and fall back to best local profile below
      }

      return [...group].sort((a, b) => scoreUserProfile(b) - scoreUserProfile(a))[0]!
    })
  )

  return canonicalUsers.sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`))
}

export async function getAllUsers(): Promise<ActionResponse<UserProfile[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    if (!hasPermission(user.rol, "users:view")) return { success: false, error: "No tienes permisos para ver usuarios" }

    if (isLocalMode()) {
      const allUsers = getDemoUsers().map((u) => ({ ...u, foto_perfil_url: null }) as UserProfile)
      return { success: true, data: allUsers }
    }

    if (isFirebaseMode()) {
      return { success: true, data: await fbGetCanonicalUsers() }
    }

    return { success: false, error: "Usuarios requiere configuración Firebase válida" }
  } catch (error) {
    return { success: false, error: "Error inesperado al obtener usuarios" }
  }
}

export async function getUserById(userId: string): Promise<ActionResponse<UserProfile>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    if (user.id !== userId && !hasPermission(user.rol, "users:view")) return { success: false, error: "Sin permisos" }

    if (isLocalMode()) {
      const demoUser = getDemoUsers().find((u) => u.id === userId) ?? getDemoCurrentUser()
      return { success: true, data: { ...demoUser, foto_perfil_url: null } as UserProfile }
    }

    if (isFirebaseMode()) {
      const profile = await fbGetUserWithPhoto(userId)
      if (!profile) return { success: false, error: "Usuario no encontrado" }
      return { success: true, data: profile }
    }

    return { success: false, error: "Usuarios requiere configuración Firebase válida" }
  } catch (error) {
    return { success: false, error: "Error inesperado al obtener usuario" }
  }
}

export async function updateUserProfile(userId: string, updates: UserUpdateInput): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }

    const targetResult = await getUserById(userId)
    if (!targetResult.success || !targetResult.data) {
      return { success: false, error: targetResult.error || "Usuario no encontrado" }
    }

    const canUpdate = user.id === userId || canEditUserProfile(user.rol, targetResult.data.rol)
    if (!canUpdate) return { success: false, error: "No tienes permisos para editar este usuario" }

    // Solo presidente puede cambiar roles
    if (updates.rol && !isDeveloperUser(user)) {
      return { success: false, error: "Solo el desarrollador puede cambiar roles del sistema" }
    }

    // Sincronizar nivel_jerarquico cuando cambia el rol
    const finalUpdates: UserUpdateInput = { ...updates }
    if (updates.rol) {
      finalUpdates.nivel_jerarquico = ROLE_HIERARCHY[updates.rol]
    }

    if (isLocalMode()) {
      const updated = updateDemoUser(userId, cleanForFirestore(finalUpdates) as Partial<UserProfile>)
      if (!updated) return { success: false, error: "Usuario no encontrado" }
      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, message: "Perfil actualizado (modo local)" }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const existingDoc = await db.collection("users").doc(userId).get()
      const previousRole = existingDoc.exists ? existingDoc.data()?.rol : null
      const previousState = existingDoc.exists ? existingDoc.data()?.estado : null
      await db.collection("users").doc(userId).update(cleanForFirestore({ ...finalUpdates, updated_at: new Date().toISOString() }))
      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)

      if (canEditUserProfile(user.rol, targetResult.data.rol) && user.id !== userId) {
        const target = await fbGetUserWithPhoto(userId)
        if (target) {
          const roleChanged = previousRole && updates.rol && previousRole !== updates.rol
          const statusChanged = previousState && updates.estado && previousState !== updates.estado
          await notifyAdministrativeUserEvent({
            actor: user,
            affectedUser: target,
            type: roleChanged ? "user_role_changed" : statusChanged ? "user_status_changed" : "user_updated",
            title: roleChanged
              ? "Rol de usuario actualizado"
              : statusChanged
                ? `Usuario ${updates.estado === "activo" ? "activado" : "desactivado"}`
                : "Perfil de usuario actualizado",
            message: roleChanged
              ? `${user.nombre} ${user.apellido} cambió el rol de ${target.nombre} ${target.apellido} a ${target.rol}.`
              : statusChanged
                ? `${user.nombre} ${user.apellido} cambió el estado de ${target.nombre} ${target.apellido} a ${target.estado}.`
                : `${user.nombre} ${user.apellido} actualizó la información administrativa de ${target.nombre} ${target.apellido}.`,
          })
        }
      }

      return { success: true, message: "Perfil actualizado exitosamente" }
    }

    return { success: false, error: "Usuarios requiere configuración Firebase válida" }
  } catch (error) {
    return { success: false, error: "Error inesperado al actualizar perfil" }
  }
}

export async function setUserStatusAction(userId: string, estado: "activo" | "inactivo"): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { success: false, error: "No autenticado" }
    if (!hasPermission(currentUser.rol, "users:edit")) return { success: false, error: "No tienes permisos para cambiar el estado de usuarios" }
    if (currentUser.id === userId && estado === "inactivo") return { success: false, error: "No puedes desactivar tu propia cuenta" }

    return await updateUserProfile(userId, { estado })
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Error inesperado al cambiar el estado del usuario" }
  }
}

export async function uploadProfilePhoto(userId: string, file: File): Promise<ActionResponse<string>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    const targetResult = await getUserById(userId)
    if (!targetResult.success || !targetResult.data) return { success: false, error: targetResult.error || "Usuario no encontrado" }

    const canUpload = user.id === userId || canEditUserProfile(user.rol, targetResult.data.rol)
    if (!canUpload) return { success: false, error: "No tienes permisos para subir foto" }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) return { success: false, error: "Tipo de archivo no permitido. Solo JPEG, PNG o WEBP" }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) return { success: false, error: "El archivo es demasiado grande. Maximo 5 MB" }

    if (isLocalMode()) return { success: false, error: "Subida de fotos no disponible en modo local" }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const timestamp = Date.now()
      const extension = file.name.split(".").pop()
      const storagePath = `profile-photos/${userId}/profile-${timestamp}.${extension}`

      const userDoc = await db.collection("users").doc(userId).get()
      if (userDoc.exists) {
        const oldPath = userDoc.data()!.foto_perfil_path as string | null
        if (oldPath) {
          try { await deleteFileFromStorage(oldPath) } catch {}
        }
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const savedPath = await uploadFileToStorage(storagePath, buffer, file.type)
      await db.collection("users").doc(userId).update({ foto_perfil_path: savedPath, updated_at: new Date().toISOString() })

      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, data: savedPath, message: "Foto de perfil subida exitosamente" }
    }

    return { success: false, error: "Usuarios requiere configuración Firebase válida" }
  } catch (error) {
    return { success: false, error: "Error inesperado al subir foto de perfil" }
  }
}

export async function deleteProfilePhoto(userId: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }
    const targetResult = await getUserById(userId)
    if (!targetResult.success || !targetResult.data) return { success: false, error: targetResult.error || "Usuario no encontrado" }

    const canDelete = user.id === userId || canEditUserProfile(user.rol, targetResult.data.rol)
    if (!canDelete) return { success: false, error: "No tienes permisos para eliminar esta foto" }

    if (isLocalMode()) return { success: false, error: "No disponible en modo local" }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const doc = await db.collection("users").doc(userId).get()
      if (!doc.exists) return { success: false, error: "Usuario no encontrado" }
      const oldPath = doc.data()!.foto_perfil_path as string | null
      if (oldPath) {
        try { await deleteFileFromStorage(oldPath) } catch {}
      }
      await db.collection("users").doc(userId).update({ foto_perfil_path: null, updated_at: new Date().toISOString() })
      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${userId}`)
      return { success: true, message: "Foto de perfil eliminada" }
    }

    return { success: false, error: "Usuarios requiere configuración Firebase válida" }
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
  email?: string
  telefono?: string
  password?: string
  rol: UserRole
  cedula?: string
}): Promise<ActionResponse<{ id: string }>> {
  try {
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
    const currentUser = await getCurrentUser()
    const createdUser = result.data?.user
    if (currentUser && createdUser) {
      await notifyAdministrativeUserEvent({
        actor: currentUser,
        affectedUser: createdUser,
        type: "user_created",
        title: "Nuevo usuario creado",
        message: `${currentUser.nombre} ${currentUser.apellido} creó el usuario ${createdUser.nombre} ${createdUser.apellido} con rol ${createdUser.rol}.`,
      })
    }
    return { success: true, data: { id }, message: result.message }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error inesperado al crear usuario",
    }
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { success: false, error: "No autenticado" }
    if (!hasPermission(currentUser.rol, "users:delete")) {
      return { success: false, error: "No tienes permisos para eliminar usuarios" }
    }
    if (currentUser.id === userId) {
      return { success: false, error: "No puedes eliminar tu propia cuenta" }
    }

    if (isLocalMode()) {
      return { success: false, error: "Eliminación no disponible en modo local" }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const auth = getAdminAuth()
      const docRef = db.collection("users").doc(userId)
      const userDoc = await docRef.get()
      if (!userDoc.exists) return { success: false, error: "Usuario no encontrado" }
      const targetUser = fromFirestoreDoc<UserProfile>(userId, userDoc.data()!)

      const userData = userDoc.data() || {}
      const fotoPerfilPath = userData.foto_perfil_path as string | null | undefined
      if (fotoPerfilPath) {
        try { await deleteFileFromStorage(fotoPerfilPath) } catch {}
      }

      await docRef.delete()

      try {
        await auth.deleteUser(userId)
      } catch {
        // If the Firestore profile was orphaned, removing the document is enough
      }

      revalidatePath("/dashboard/usuarios")

       await notifyAdministrativeUserEvent({
        actor: currentUser,
        affectedUser: targetUser,
        type: "user_deleted",
        title: "Usuario eliminado",
        message: `${currentUser.nombre} ${currentUser.apellido} eliminó el usuario ${targetUser.nombre} ${targetUser.apellido}.`,
      })

      return { success: true, message: "Usuario eliminado exitosamente" }
    }

    return { success: false, error: "Eliminación no soportada en el proveedor actual" }
  } catch (error) {
    return { success: false, error: "Error inesperado al eliminar usuario" }
  }
}
