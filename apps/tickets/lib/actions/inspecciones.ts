"use server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, Inspeccion, InspeccionCreateInput } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import { getCurrentUser } from "./auth"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"
import { getDemoInspeccionByTicket, createDemoInspeccion, updateDemoInspeccion } from "@/lib/mock-data"

export async function getInspeccionByTicket(ticketId: string): Promise<ActionResponse<Inspeccion | null>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const insp = getDemoInspeccionByTicket(ticketId)
    return { success: true, data: insp }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("inspecciones").where("ticket_id", "==", ticketId).orderBy("created_at", "desc").limit(1).get()
      if (snap.empty) return { success: true, data: null }
      const d = snap.docs[0]
      return { success: true, data: fromFirestoreDoc<Inspeccion>(d.id, d.data()) }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  return { success: false, error: "Inspecciones requiere configuración Firebase válida" }
}

export async function createInspeccion(ticketId: string, input: InspeccionCreateInput): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) return { success: false, error: "Sin permisos para crear inspecciones" }

  if (isLocalMode()) {
    const insp = createDemoInspeccion(ticketId, input, currentUser)
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: insp, message: "Inspeccion creada exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ticketSnap = await db.collection("tickets").doc(ticketId).get()
      if (!ticketSnap.exists) return { success: false, error: "Ticket no encontrado" }
      if (ticketSnap.data()!.tipo !== "inspeccion") return { success: false, error: "Solo tickets tipo inspeccion permiten crear inspeccion" }
      const existingSnap = await db.collection("inspecciones").where("ticket_id", "==", ticketId).limit(1).get()
      if (!existingSnap.empty) return { success: false, error: "Ya existe una inspeccion para este ticket" }
      const now = new Date().toISOString()
      const ref = db.collection("inspecciones").doc()
      const data = cleanForFirestore({
        ticket_id: ticketId, realizado_por: currentUser.id, fecha_inspeccion: now,
        datos_checklist: input.datos_checklist, observaciones_generales: input.observaciones_generales || null,
        recomendaciones: input.recomendaciones || null, materiales_requeridos: input.materiales_requeridos || [],
        estado: "borrador", created_at: now, updated_at: now,
      })
      await ref.set(data)
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, data: fromFirestoreDoc<Inspeccion>(ref.id, data), message: "Inspeccion creada exitosamente" }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  return { success: false, error: "Inspecciones requiere configuración Firebase válida" }
}

export async function updateInspeccion(inspeccionId: string, input: Partial<InspeccionCreateInput>): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) return { success: false, error: "Sin permisos para actualizar inspecciones" }

  if (isLocalMode()) {
    const updated = updateDemoInspeccion(inspeccionId, input)
    if (!updated) return { success: false, error: "Inspeccion no encontrada" }
    revalidatePath(`/dashboard/tickets/${updated.ticket_id}`)
    return { success: true, data: updated, message: "Inspeccion actualizada exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("inspecciones").doc(inspeccionId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Inspeccion no encontrada" }
      const now = new Date().toISOString()
      const updateData: Record<string, unknown> = { updated_at: now }
      if (input.datos_checklist !== undefined) updateData.datos_checklist = input.datos_checklist
      if (input.observaciones_generales !== undefined) updateData.observaciones_generales = input.observaciones_generales
      if (input.recomendaciones !== undefined) updateData.recomendaciones = input.recomendaciones
      if (input.materiales_requeridos !== undefined) updateData.materiales_requeridos = input.materiales_requeridos
      await ref.update(cleanForFirestore(updateData))
      const updated = fromFirestoreDoc<Inspeccion>(inspeccionId, { ...snap.data()!, ...updateData })
      revalidatePath(`/dashboard/tickets/${updated.ticket_id}`)
      return { success: true, data: updated, message: "Inspeccion actualizada exitosamente" }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  return { success: false, error: "Inspecciones requiere configuración Firebase válida" }
}

export async function completarInspeccion(inspeccionId: string): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) return { success: false, error: "Sin permisos para completar inspecciones" }

  if (isLocalMode()) {
    const completed = updateDemoInspeccion(inspeccionId, { estado: "completada" })
    if (!completed) return { success: false, error: "Inspeccion no encontrada" }
    revalidatePath(`/dashboard/tickets/${completed.ticket_id}`)
    return { success: true, data: completed, message: "Inspeccion completada exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("inspecciones").doc(inspeccionId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Inspeccion no encontrada" }
      const d = snap.data()!
      if (d.estado !== "borrador") return { success: false, error: "Inspeccion no encontrada o ya completada" }
      const now = new Date().toISOString()
      await ref.update({ estado: "completada", updated_at: now })
      const updated = fromFirestoreDoc<Inspeccion>(inspeccionId, { ...d, estado: "completada", updated_at: now })
      revalidatePath(`/dashboard/tickets/${updated.ticket_id}`)
      return { success: true, data: updated, message: "Inspeccion completada exitosamente" }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  return { success: false, error: "Inspecciones requiere configuración Firebase válida" }
}

export async function deleteInspeccion(inspeccionId: string): Promise<ActionResponse<void>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos para eliminar inspecciones" }

  if (isLocalMode()) {
    // En local mode, simplemente indicamos éxito (no hay persistencia real)
    revalidatePath("/dashboard/tickets")
    return { success: true, message: "Inspeccion eliminada exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("inspecciones").doc(inspeccionId).get()
      if (!snap.exists) return { success: false, error: "Inspeccion no encontrada" }
      const ticketId = snap.data()!.ticket_id as string
      await db.collection("inspecciones").doc(inspeccionId).delete()
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, message: "Inspeccion eliminada exitosamente" }
    } catch (err) { return { success: false, error: (err as Error).message } }
  }

  return { success: false, error: "Inspecciones requiere configuración Firebase válida" }
}
