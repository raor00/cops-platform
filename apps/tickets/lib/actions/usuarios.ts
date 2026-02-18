"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, UserProfile, UserUpdateInput } from "@/types"
import { getCurrentUser } from "./auth"
import { ROLE_HIERARCHY } from "@/types"

const BUCKET_NAME = "user-profiles"

/**
 * Obtener todos los usuarios con sus perfiles
 */
export async function getAllUsers(): Promise<ActionResponse<UserProfile[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    // Solo gerente o superior puede ver todos los usuarios
    if (ROLE_HIERARCHY[user.rol] < 3) {
      return { success: false, error: "No tienes permisos para ver usuarios" }
    }

    const supabase = await createClient()

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .order("nombre", { ascending: true })

    if (error) {
      return {
        success: false,
        error: `Error al obtener usuarios: ${error.message}`,
      }
    }

    // Generar URLs firmadas para fotos de perfil
    const usersWithUrls = await Promise.all(
      (users || []).map(async (u) => {
        if (u.foto_perfil_path) {
          const { data: signedUrl } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(u.foto_perfil_path, 3600)

          return {
            ...u,
            foto_perfil_url: signedUrl?.signedUrl || null,
          } as UserProfile
        }
        return { ...u, foto_perfil_url: null } as UserProfile
      })
    )

    return {
      success: true,
      data: usersWithUrls,
    }
  } catch (error) {
    console.error("[v0] Get users exception:", error)
    return {
      success: false,
      error: "Error inesperado al obtener usuarios",
    }
  }
}

/**
 * Obtener un usuario por ID con foto de perfil
 */
export async function getUserById(
  userId: string
): Promise<ActionResponse<UserProfile>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    const supabase = await createClient()

    const { data: targetUser, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !targetUser) {
      return { success: false, error: "Usuario no encontrado" }
    }

    // Generar URL firmada para foto de perfil
    let fotoPerfilUrl = null
    if (targetUser.foto_perfil_path) {
      const { data: signedUrl } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(targetUser.foto_perfil_path, 3600)
      fotoPerfilUrl = signedUrl?.signedUrl || null
    }

    return {
      success: true,
      data: {
        ...targetUser,
        foto_perfil_url: fotoPerfilUrl,
      } as UserProfile,
    }
  } catch (error) {
    console.error("[v0] Get user exception:", error)
    return {
      success: false,
      error: "Error inesperado al obtener usuario",
    }
  }
}

/**
 * Actualizar perfil de usuario (incluye foto de perfil)
 */
export async function updateUserProfile(
  userId: string,
  updates: UserUpdateInput
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    // Verificar permisos: solo puede editar su propio perfil o gerente+
    const canUpdate = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3

    if (!canUpdate) {
      return { success: false, error: "No tienes permisos para editar este usuario" }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)

    if (error) {
      return {
        success: false,
        error: `Error al actualizar perfil: ${error.message}`,
      }
    }

    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)

    return {
      success: true,
      message: "Perfil actualizado exitosamente",
    }
  } catch (error) {
    console.error("[v0] Update profile exception:", error)
    return {
      success: false,
      error: "Error inesperado al actualizar perfil",
    }
  }
}

/**
 * Subir foto de perfil
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<ActionResponse<string>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    // Solo puede subir su propia foto o gerente+
    const canUpload = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3

    if (!canUpload) {
      return { success: false, error: "No tienes permisos para subir foto" }
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de archivo no permitido. Solo JPEG, PNG o WEBP",
      }
    }

    // Validar tamaño (5 MB máximo para fotos de perfil)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: "El archivo es demasiado grande. Máximo 5 MB",
      }
    }

    const supabase = await createClient()

    // Obtener usuario actual para eliminar foto anterior si existe
    const { data: targetUser } = await supabase
      .from("users")
      .select("foto_perfil_path")
      .eq("id", userId)
      .single()

    // Eliminar foto anterior si existe
    if (targetUser?.foto_perfil_path) {
      await supabase.storage
        .from(BUCKET_NAME)
        .remove([targetUser.foto_perfil_path])
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const fileName = `${userId}/profile-${timestamp}.${extension}`

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("[v0] Error uploading profile photo:", uploadError)
      return {
        success: false,
        error: `Error al subir foto: ${uploadError.message}`,
      }
    }

    // Actualizar referencia en la base de datos
    const { error: dbError } = await supabase
      .from("users")
      .update({ foto_perfil_path: uploadData.path })
      .eq("id", userId)

    if (dbError) {
      console.error("[v0] Error updating user record:", dbError)
      // Intentar eliminar el archivo subido si falla la actualización
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path])
      return {
        success: false,
        error: `Error al actualizar perfil: ${dbError.message}`,
      }
    }

    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)

    return {
      success: true,
      data: uploadData.path,
      message: "Foto de perfil subida exitosamente",
    }
  } catch (error) {
    console.error("[v0] Upload profile photo exception:", error)
    return {
      success: false,
      error: "Error inesperado al subir foto de perfil",
    }
  }
}

/**
 * Eliminar foto de perfil
 */
export async function deleteProfilePhoto(
  userId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    // Solo puede eliminar su propia foto o gerente+
    const canDelete = user.id === userId || ROLE_HIERARCHY[user.rol] >= 3

    if (!canDelete) {
      return { success: false, error: "No tienes permisos para eliminar esta foto" }
    }

    const supabase = await createClient()

    // Obtener usuario para saber qué archivo eliminar
    const { data: targetUser } = await supabase
      .from("users")
      .select("foto_perfil_path")
      .eq("id", userId)
      .single()

    if (!targetUser?.foto_perfil_path) {
      return { success: false, error: "No hay foto de perfil para eliminar" }
    }

    // Eliminar archivo de Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([targetUser.foto_perfil_path])

    if (storageError) {
      console.error("[v0] Error deleting from storage:", storageError)
    }

    // Actualizar registro en la base de datos
    const { error: dbError } = await supabase
      .from("users")
      .update({ foto_perfil_path: null })
      .eq("id", userId)

    if (dbError) {
      return {
        success: false,
        error: `Error al eliminar foto: ${dbError.message}`,
      }
    }

    revalidatePath("/dashboard/usuarios")
    revalidatePath(`/dashboard/usuarios/${userId}`)

    return {
      success: true,
      message: "Foto de perfil eliminada exitosamente",
    }
  } catch (error) {
    console.error("[v0] Delete profile photo exception:", error)
    return {
      success: false,
      error: "Error inesperado al eliminar foto de perfil",
    }
  }
}

/**
 * Cambiar estado de usuario (activo/inactivo)
 */
export async function toggleUserStatus(
  userId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    // Solo gerente o superior puede cambiar estados
    if (ROLE_HIERARCHY[user.rol] < 3) {
      return {
        success: false,
        error: "No tienes permisos para cambiar el estado de usuarios",
      }
    }

    const supabase = await createClient()

    // Obtener estado actual
    const { data: targetUser } = await supabase
      .from("users")
      .select("estado")
      .eq("id", userId)
      .single()

    if (!targetUser) {
      return { success: false, error: "Usuario no encontrado" }
    }

    const nuevoEstado = targetUser.estado === "activo" ? "inactivo" : "activo"

    // Actualizar estado
    const { error } = await supabase
      .from("users")
      .update({ estado: nuevoEstado })
      .eq("id", userId)

    if (error) {
      return {
        success: false,
        error: `Error al cambiar estado: ${error.message}`,
      }
    }

    revalidatePath("/dashboard/usuarios")

    return {
      success: true,
      message: `Usuario ${nuevoEstado === "activo" ? "activado" : "desactivado"} exitosamente`,
    }
  } catch (error) {
    console.error("[v0] Toggle user status exception:", error)
    return {
      success: false,
      error: "Error inesperado al cambiar estado del usuario",
    }
  }
}
