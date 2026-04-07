"use server"

import { revalidatePath } from "next/cache"
import type { ActionResponse, TicketDocumento, TipoDocumento } from "@/types"
import { ROLE_HIERARCHY, DOCUMENTO_UPLOAD_CONFIG } from "@/types"
import { getCurrentUser } from "./auth"
import { isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import {
  createDemoDocumento,
  deleteDemoDocumento,
  getDemoDocumentoById,
  getDemoDocumentosByTicket,
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

const STORAGE_FOLDER = "ticket-documentos"

async function canAccessTicketDocumentos(
  ticketId: string,
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
): Promise<boolean> {
  // All roles can view/upload documents for tickets they have access to
  if (ROLE_HIERARCHY[user.rol] >= 2) return true
  if (user.rol !== "tecnico") return false

  if (isLocalMode()) {
    const { getDemoTicketById } = await import("@/lib/mock-data")
    const ticket = getDemoTicketById(ticketId, user)
    return ticket?.tecnico_id === user.id
  }

  if (isFirebaseMode()) {
    const doc = await getAdminFirestore().collection("tickets").doc(ticketId).get()
    return doc.exists && doc.data()?.tecnico_id === user.id
  }

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()
  const { data } = await supabase.from("tickets").select("tecnico_id").eq("id", ticketId).single()
  return data?.tecnico_id === user.id
}

export async function uploadTicketDocumento(
  ticketId: string,
  file: File,
  tipoDocumento: TipoDocumento = "otro",
  descripcion?: string
): Promise<ActionResponse<TicketDocumento>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }

    if (!(await canAccessTicketDocumentos(ticketId, user))) {
      return { success: false, error: "No tienes permisos para subir documentos" }
    }

    // Validate file type
    const extension = file.name.split(".").pop()?.toLowerCase() ?? ""
    const isAllowedType = DOCUMENTO_UPLOAD_CONFIG.allowedTypes.includes(file.type) ||
      (DOCUMENTO_UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(extension)

    if (!isAllowedType) {
      return {
        success: false,
        error: "Tipo de archivo no permitido. Sube PDF, imágenes o documentos Office (Word, Excel).",
      }
    }

    if (file.size > DOCUMENTO_UPLOAD_CONFIG.maxSizeBytes) {
      return { success: false, error: "El archivo es demasiado grande. Máximo 25 MB." }
    }

    if (isLocalMode()) {
      const doc = createDemoDocumento(
        ticketId,
        { nombre_archivo: file.name, tipo_documento: tipoDocumento, descripcion, tamanio_bytes: file.size, mime_type: file.type },
        user
      )
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, data: doc, message: "Documento subido exitosamente" }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const fileName = `${STORAGE_FOLDER}/${ticketId}/${timestamp}-${random}-${file.name}`
      const buffer = Buffer.from(await file.arrayBuffer())
      const now = new Date().toISOString()

      await uploadFileToStorage(fileName, buffer, file.type)

      const docRef = db.collection("ticket_documentos").doc()
      const docData = cleanForFirestore({
        ticket_id: ticketId,
        subido_por: user.id,
        storage_path: fileName,
        nombre_archivo: file.name,
        tipo_documento: tipoDocumento,
        descripcion: descripcion || null,
        tamanio_bytes: file.size,
        mime_type: file.type,
        created_at: now,
      })

      await docRef.set(docData)
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return {
        success: true,
        data: fromFirestoreDoc<TicketDocumento>(docRef.id, { ...docData, subidor: { nombre: user.nombre, apellido: user.apellido, rol: user.rol } }),
        message: "Documento subido exitosamente",
      }
    }

    // Supabase mode
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const fileName = `${ticketId}/${timestamp}-${random}-${file.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("ticket-documentos")
      .upload(fileName, file, { cacheControl: "3600", upsert: false })

    if (uploadError) {
      return { success: false, error: `Error al subir archivo: ${uploadError.message}` }
    }

    const { data: docData, error: dbError } = await supabase
      .from("ticket_documentos")
      .insert({
        ticket_id: ticketId,
        subido_por: user.id,
        storage_path: uploadData.path,
        nombre_archivo: file.name,
        tipo_documento: tipoDocumento,
        descripcion: descripcion || null,
        tamanio_bytes: file.size,
        mime_type: file.type,
      })
      .select("*")
      .single()

    if (dbError) {
      await supabase.storage.from("ticket-documentos").remove([uploadData.path])
      return { success: false, error: `Error al registrar documento: ${dbError.message}` }
    }

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: docData as TicketDocumento, message: "Documento subido exitosamente" }
  } catch (error) {
    console.error("[documentos] upload exception:", error)
    return { success: false, error: "Error inesperado al subir el documento" }
  }
}

export async function getTicketDocumentos(
  ticketId: string
): Promise<ActionResponse<TicketDocumento[]>> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }

    if (!(await canAccessTicketDocumentos(ticketId, user))) {
      return { success: false, error: "Sin permisos" }
    }

    if (isLocalMode()) {
      return { success: true, data: getDemoDocumentosByTicket(ticketId) }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db
        .collection("ticket_documentos")
        .where("ticket_id", "==", ticketId)
        .get()

      const docs = await Promise.all(
        snap.docs.map(async (d) => {
          const doc = fromFirestoreDoc<TicketDocumento>(d.id, d.data())
          const url = await getSignedDownloadUrl(doc.storage_path).catch(() => null)
          return { ...doc, url }
        })
      )

      docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      return { success: true, data: docs }
    }

    // Supabase mode
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ticket_documentos")
      .select("*, subidor:subido_por(id, nombre, apellido, rol)")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: false })

    if (error) return { success: false, error: error.message }

    const docsConUrls = await Promise.all(
      (data || []).map(async (doc) => {
        const { data: signed } = await supabase.storage
          .from("ticket-documentos")
          .createSignedUrl(doc.storage_path, 3600)
        return { ...doc, url: signed?.signedUrl || null } as TicketDocumento
      })
    )

    return { success: true, data: docsConUrls }
  } catch (error) {
    console.error("[documentos] get exception:", error)
    return { success: false, error: "Error inesperado al obtener documentos" }
  }
}

export async function deleteTicketDocumento(
  documentoId: string
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, error: "No autenticado" }

    if (isLocalMode()) {
      const doc = getDemoDocumentoById(documentoId)
      if (!doc) return { success: false, error: "Documento no encontrado" }
      const deleted = deleteDemoDocumento(documentoId, user.id, ROLE_HIERARCHY[user.rol])
      if (!deleted) return { success: false, error: "No tienes permisos para eliminar este documento" }
      revalidatePath(`/dashboard/tickets/${doc.ticket_id}`)
      return { success: true, message: "Documento eliminado" }
    }

    if (isFirebaseMode()) {
      const db = getAdminFirestore()
      const snap = await db.collection("ticket_documentos").doc(documentoId).get()
      if (!snap.exists) return { success: false, error: "Documento no encontrado" }

      const doc = fromFirestoreDoc<TicketDocumento>(documentoId, snap.data()!)
      const canDelete = doc.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3
      if (!canDelete) return { success: false, error: "No tienes permisos para eliminar este documento" }

      await deleteFileFromStorage(doc.storage_path)
      await db.collection("ticket_documentos").doc(documentoId).delete()
      revalidatePath(`/dashboard/tickets/${doc.ticket_id}`)
      return { success: true, message: "Documento eliminado" }
    }

    // Supabase mode
    const { createClient } = await import("@/lib/supabase/server")
    const supabase = await createClient()
    const { data: doc, error: fetchError } = await supabase
      .from("ticket_documentos")
      .select("*")
      .eq("id", documentoId)
      .single()

    if (fetchError || !doc) return { success: false, error: "Documento no encontrado" }

    const canDelete = doc.subido_por === user.id || ROLE_HIERARCHY[user.rol] >= 3
    if (!canDelete) return { success: false, error: "No tienes permisos para eliminar este documento" }

    await supabase.storage.from("ticket-documentos").remove([doc.storage_path])
    const { error: dbError } = await supabase.from("ticket_documentos").delete().eq("id", documentoId)
    if (dbError) return { success: false, error: dbError.message }

    revalidatePath(`/dashboard/tickets/${doc.ticket_id}`)
    return { success: true, message: "Documento eliminado" }
  } catch (error) {
    console.error("[documentos] delete exception:", error)
    return { success: false, error: "Error inesperado al eliminar el documento" }
  }
}
