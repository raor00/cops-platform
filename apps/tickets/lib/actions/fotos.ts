"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, TicketFoto, TipoFoto } from "@/types"
import { getCurrentUser } from "./auth"
import { ROLE_HIERARCHY } from "@/types"
import { isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import {
  addDemoUpdateLog,
  createDemoFoto,
  deleteDemoFoto,
  getDemoFotoById,
  getDemoFotosByTicket,
  getDemoTicketById,
  updateDemoFoto,
} from "@/lib/mock-data"
import {
  cleanForFirestore,
  fromFirestoreDoc,
  getAdminFirestore,
} from "@/lib/firebase/admin"
import {
  uploadFileToStorage,
  getSignedDownloadUrl,
  deleteFileFromStorage,
} from "@/lib/firebase/storage-rest"

const BUCKET_NAME = "ticket-fotos"

async function canUploadFotoToTicket(
  ticketId: string,
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
): Promise<boolean> {
  if (ROLE_HIERARCHY[user.rol] >= 2) return true
  if (user.rol !== "tecnico") return false

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, user)
    return ticket?.tecnico_id === user.id
  }

  if (isFirebaseMode()) {
    const doc = await getAdminFirestore().collection("tickets").doc(ticketId).get()
    return doc.exists && doc.data()?.tecnico_id === user.id
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("tickets")
    .select("tecnico_id")
    .eq("id", ticketId)
    .single()

  return data?.tecnico_id === user.id
}

/**
 * Subir foto a Supabase Storage y crear registro en DB
 */
export async function uploadTicketFoto(
  ticketId: string,
  file: File,
  tipoFoto: TipoFoto = "progreso",
  descripcion?: string
): Promise<ActionResponse<TicketFoto>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    if (!(await canUploadFotoToTicket(ticketId, user))) {
      return { success: false, error: "No tienes permisos para subir fotos" }
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"]
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Tipo de archivo no permitido. Solo JPEG, PNG, WEBP o HEIC",
      }
    }

    // Validar tamaño (10 MB máximo)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        success: false,
        error: "El archivo es demasiado grande. Máximo 10 MB",
      }
    }

    // Generar nombre único para el archivo
    if (isLocalMode()) {
      const foto = createDemoFoto(
        ticketId,
        {
          nombre_archivo: file.name,
          tipo_foto: tipoFoto,
          descripcion,
        },
        user
      )

      addDemoUpdateLog({
        ticket_id: ticketId,
        autor_id: user.id,
        contenido: `Foto subida: ${file.name}${descripcion ? ` — ${descripcion}` : ""}`,
        tipo: "nota",
        autor: { nombre: user.nombre, apellido: user.apellido, rol: user.rol },
      })

      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return {
        success: true,
        data: foto,
        message: "Foto subida exitosamente",
      }
    }

    if (isFirebaseMode()) {
      try {
        const db = getAdminFirestore()
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(7)
        const extension = file.name.split(".").pop()
        const storagePath = `ticket-fotos/${ticketId}/${timestamp}-${randomString}.${extension}`
        const buffer = Buffer.from(await file.arrayBuffer())
        const now = new Date().toISOString()

        await uploadFileToStorage(storagePath, buffer, file.type)

        const fotoRef = db.collection("ticket_fotos").doc()
        const fotoData = cleanForFirestore({
          ticket_id: ticketId,
          subido_por: user.id,
          storage_path: storagePath,
          nombre_archivo: file.name,
          tipo_foto: tipoFoto,
          descripcion: descripcion || null,
          tamanio_bytes: file.size,
          mime_type: file.type,
          created_at: now,
        })

        await fotoRef.set(fotoData)
        await db.collection("update-logs").doc().set(
          cleanForFirestore({
            ticket_id: ticketId,
            autor_id: user.id,
            contenido: `Foto subida: ${file.name}${descripcion ? ` — ${descripcion}` : ""}`,
            tipo: "nota" as const,
            created_at: now,
            autor: { nombre: user.nombre, apellido: user.apellido, rol: user.rol },
          })
        )

        revalidatePath(`/dashboard/tickets/${ticketId}`)
        return {
          success: true,
          data: fromFirestoreDoc<TicketFoto>(fotoRef.id, fotoData),
          message: "Foto subida exitosamente",
        }
      } catch (firebaseErr) {
        const msg = firebaseErr instanceof Error ? firebaseErr.message : String(firebaseErr)
        console.error("[fotos] Firebase upload error:", msg)
        return { success: false, error: `Error al subir foto: ${msg}` }
      }
    }

    const supabase = await createClient()
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const extension = file.name.split(".").pop()
    const fileName = `${ticketId}/${timestamp}-${randomString}.${extension}`

    // Subir archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Error uploading file:", uploadError)
      return {
        success: false,
        error: `Error al subir archivo: ${uploadError.message}`,
      }
    }

    // Crear registro en la base de datos
    const { data: fotoData, error: dbError } = await supabase
      .from("ticket_fotos")
      .insert({
        ticket_id: ticketId,
        subido_por: user.id,
        storage_path: uploadData.path,
        nombre_archivo: file.name,
        tipo_foto: tipoFoto,
        descripcion: descripcion || null,
        tamanio_bytes: file.size,
        mime_type: file.type,
      })
      .select("*")
      .single()

    if (dbError) {
      console.error("[v0] Error creating DB record:", dbError)
      // Intentar eliminar el archivo subido si falla el registro en DB
      await supabase.storage.from(BUCKET_NAME).remove([uploadData.path])
      return {
        success: false,
        error: `Error al registrar foto: ${dbError.message}`,
      }
    }

    // Registrar en historial
    await supabase.from("historial_cambios").insert({
      ticket_id: ticketId,
      usuario_id: user.id,
      tipo_cambio: "foto_subida",
      observacion: `Foto de tipo "${tipoFoto}" subida: ${file.name}`,
    })

    revalidatePath(`/dashboard/tickets/${ticketId}`)

    return {
      success: true,
      data: fotoData as TicketFoto,
      message: "Foto subida exitosamente",
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[fotos] Upload exception:", msg)
    return { success: false, error: `Error al subir foto: ${msg}` }
  }
}

/**
 * Obtener todas las fotos de un ticket con URLs firmadas
 */
export async function getTicketFotos(
  ticketId: string
): Promise<ActionResponse<TicketFoto[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    if (!(await canUploadFotoToTicket(ticketId, user))) {
      return { success: false, error: "No tienes permisos para ver fotos de este ticket" }
    }

    if (isLocalMode()) {
      return {
        success: true,
        data: getDemoFotosByTicket(ticketId),
      }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db.collection("ticket_fotos").where("ticket_id", "==", ticketId).get()

      const fotosConUrls = await Promise.all(
        snap.docs.map(async (doc) => {
          const foto = fromFirestoreDoc<TicketFoto>(doc.id, doc.data())
          const url = await getSignedDownloadUrl(foto.storage_path).catch(() => undefined)
          return { ...foto, url }
        })
      )

      fotosConUrls.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return { success: true, data: fotosConUrls }
    }

    const supabase = await createClient()

    // Obtener fotos de la base de datos
    const { data: fotos, error } = await supabase
      .from("ticket_fotos")
      .select(`
        *,
        subidor:subido_por (
          id,
          nombre,
          apellido,
          rol
        )
      `)
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false })

    if (error) {
      return {
        success: false,
        error: `Error al obtener fotos: ${error.message}`,
      }
    }

    // Generar URLs firmadas para cada foto
    const fotosConUrls = await Promise.all(
      (fotos || []).map(async (foto) => {
        const { data: signedUrl } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(foto.storage_path, 3600) // 1 hora de validez

        return {
          ...foto,
          url: signedUrl?.signedUrl || null,
        } as TicketFoto
      })
    )

    return {
      success: true,
      data: fotosConUrls,
    }
  } catch (error) {
    console.error("[v0] Get fotos exception:", error)
    return {
      success: false,
      error: "Error inesperado al obtener fotos",
    }
  }
}

/**
 * Eliminar foto de un ticket
 */
export async function deleteTicketFoto(
  fotoId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    if (isLocalMode()) {
      const foto = getDemoFotoById(fotoId)
      if (!foto) return { success: false, error: "Foto no encontrada" }

      const deleted = deleteDemoFoto(fotoId, user.id, ROLE_HIERARCHY[user.rol])
      if (!deleted) {
        return { success: false, error: "No tienes permisos para eliminar esta foto" }
      }

      addDemoUpdateLog({
        ticket_id: foto.ticket_id,
        autor_id: user.id,
        contenido: `Foto eliminada: ${foto.nombre_archivo}`,
        tipo: "nota",
        autor: { nombre: user.nombre, apellido: user.apellido, rol: user.rol },
      })

      revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)
      return {
        success: true,
        message: "Foto eliminada exitosamente",
      }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db.collection("ticket_fotos").doc(fotoId).get()
      if (!snap.exists) return { success: false, error: "Foto no encontrada" }

      const foto = fromFirestoreDoc<TicketFoto>(fotoId, snap.data()!)
      const canDelete = foto.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3
      if (!canDelete) {
        return { success: false, error: "No tienes permisos para eliminar esta foto" }
      }

      await deleteFileFromStorage(foto.storage_path)

      await db.collection("ticket_fotos").doc(fotoId).delete()
      await db.collection("update-logs").doc().set(
        cleanForFirestore({
          ticket_id: foto.ticket_id,
          autor_id: user.id,
          contenido: `Foto eliminada: ${foto.nombre_archivo}`,
          tipo: "nota" as const,
          created_at: new Date().toISOString(),
          autor: { nombre: user.nombre, apellido: user.apellido, rol: user.rol },
        })
      )

      revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)
      return {
        success: true,
        message: "Foto eliminada exitosamente",
      }
    }

    const supabase = await createClient()

    // Obtener información de la foto
    const { data: foto, error: fetchError } = await supabase
      .from("ticket_fotos")
      .select("*")
      .eq("id", fotoId)
      .single()

    if (fetchError || !foto) {
      return { success: false, error: "Foto no encontrada" }
    }

    // Verificar permisos: solo el que la subió o gerente+
    const canDelete =
      foto.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3

    if (!canDelete) {
      return { success: false, error: "No tienes permisos para eliminar esta foto" }
    }

    // Eliminar archivo de Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([foto.storage_path])

    if (storageError) {
      console.error("[v0] Error deleting from storage:", storageError)
    }

    // Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from("ticket_fotos")
      .delete()
      .eq("id", fotoId)

    if (dbError) {
      return {
        success: false,
        error: `Error al eliminar foto: ${dbError.message}`,
      }
    }

    // Registrar en historial
    await supabase.from("historial_cambios").insert({
      ticket_id: foto.ticket_id,
      usuario_id: user.id,
      tipo_cambio: "modificacion",
      observacion: `Foto eliminada: ${foto.nombre_archivo}`,
    })

    revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)

    return {
      success: true,
      message: "Foto eliminada exitosamente",
    }
  } catch (error) {
    console.error("[v0] Delete foto exception:", error)
    return {
      success: false,
      error: "Error inesperado al eliminar la foto",
    }
  }
}

/**
 * Actualizar descripción o tipo de una foto
 */
export async function updateTicketFoto(
  fotoId: string,
  updates: {
    descripcion?: string
    tipo_foto?: TipoFoto
  }
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "No autenticado" }
    }

    if (isLocalMode()) {
      const foto = getDemoFotoById(fotoId)
      if (!foto) return { success: false, error: "Foto no encontrada" }

      const updated = updateDemoFoto(fotoId, updates, user.id, ROLE_HIERARCHY[user.rol])
      if (!updated) {
        return { success: false, error: "No tienes permisos para modificar esta foto" }
      }

      revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)
      return {
        success: true,
        message: "Foto actualizada exitosamente",
      }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db.collection("ticket_fotos").doc(fotoId).get()
      if (!snap.exists) return { success: false, error: "Foto no encontrada" }

      const foto = fromFirestoreDoc<TicketFoto>(fotoId, snap.data()!)
      const canUpdate = foto.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3
      if (!canUpdate) {
        return { success: false, error: "No tienes permisos para modificar esta foto" }
      }

      await db.collection("ticket_fotos").doc(fotoId).update(cleanForFirestore(updates))
      revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)
      return {
        success: true,
        message: "Foto actualizada exitosamente",
      }
    }

    const supabase = await createClient()

    // Obtener información de la foto
    const { data: foto, error: fetchError } = await supabase
      .from("ticket_fotos")
      .select("*")
      .eq("id", fotoId)
      .single()

    if (fetchError || !foto) {
      return { success: false, error: "Foto no encontrada" }
    }

    // Verificar permisos
    const canUpdate =
      foto.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3

    if (!canUpdate) {
      return { success: false, error: "No tienes permisos para modificar esta foto" }
    }

    // Actualizar foto
    const { error: updateError } = await supabase
      .from("ticket_fotos")
      .update(updates)
      .eq("id", fotoId)

    if (updateError) {
      return {
        success: false,
        error: `Error al actualizar foto: ${updateError.message}`,
      }
    }

    revalidatePath(`/dashboard/tickets/${foto.ticket_id}`)

    return {
      success: true,
      message: "Foto actualizada exitosamente",
    }
  } catch (error) {
    console.error("[v0] Update foto exception:", error)
    return {
      success: false,
      error: "Error inesperado al actualizar la foto",
    }
  }
}
