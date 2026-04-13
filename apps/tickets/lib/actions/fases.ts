"use server"

import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  FaseCreateInput,
  FaseUpdateInput,
  TicketFase,
} from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import { getCurrentUser } from "./auth"
import { isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import {
  getDemoFasesByTicket,
  createDemoFase,
  updateDemoFase,
  deleteDemoFase,
} from "@/lib/mock-data"
import { cleanForFirestore, fromFirestoreDoc, getAdminFirestore } from "@/lib/firebase/admin"

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER FASES DE UN TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function getFasesByTicket(ticketId: string): Promise<ActionResponse<TicketFase[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoFasesByTicket(ticketId) }
  }

  if (isFirebaseMode()) {
    try {
      const snap = await getAdminFirestore()
        .collection("ticket_fases")
        .where("ticket_id", "==", ticketId)
        .orderBy("orden", "asc")
        .get()

      return {
        success: true,
        data: snap.docs.map((doc) => fromFirestoreDoc<TicketFase>(doc.id, doc.data())),
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return { success: false, error: "Fases requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR FASE (Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function createFase(input: FaseCreateInput): Promise<ActionResponse<TicketFase>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos para crear fases" }

  if (isLocalMode()) {
    const fase = createDemoFase(input, currentUser)
    revalidatePath(`/dashboard/tickets/${input.ticket_id}`)
    return { success: true, data: fase, message: "Fase creada exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const existing = await db
        .collection("ticket_fases")
        .where("ticket_id", "==", input.ticket_id)
        .orderBy("orden", "desc")
        .limit(1)
        .get()

      const nextOrden =
        input.orden ??
        (existing.empty ? 1 : Number(existing.docs[0]?.data().orden || 0) + 1)
      const now = new Date().toISOString()
      const ref = db.collection("ticket_fases").doc()
      const payload = cleanForFirestore({
        ticket_id: input.ticket_id,
        nombre: input.nombre,
        descripcion: input.descripcion || null,
        orden: nextOrden,
        estado: "pendiente",
        progreso_porcentaje: 0,
        fecha_inicio_estimada: input.fecha_inicio_estimada || null,
        fecha_fin_estimada: input.fecha_fin_estimada || null,
        fecha_inicio_real: null,
        fecha_fin_real: null,
        created_at: now,
        updated_at: now,
      })

      await ref.set(payload)
      revalidatePath(`/dashboard/tickets/${input.ticket_id}`)
      return {
        success: true,
        data: fromFirestoreDoc<TicketFase>(ref.id, payload),
        message: "Fase creada exitosamente",
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return { success: false, error: "Fases requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR FASE (Gerente+ o Técnico asignado para progreso/estado)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateFase(
  id: string,
  ticketId: string,
  input: FaseUpdateInput
): Promise<ActionResponse<TicketFase>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  // Técnicos solo pueden actualizar progreso y estado
  const isGerente = ROLE_HIERARCHY[currentUser.rol] >= 3
  const isTecnico = currentUser.rol === "tecnico"

  if (!isGerente && !isTecnico) {
    return { success: false, error: "Sin permisos para actualizar fases" }
  }

  // Si es técnico, solo puede actualizar progreso_porcentaje y estado
  const safeInput: FaseUpdateInput = isGerente
    ? input
    : {
        estado: input.estado,
        progreso_porcentaje: input.progreso_porcentaje,
      }

  if (isLocalMode()) {
    const fase = updateDemoFase(id, safeInput)
    if (!fase) return { success: false, error: "Fase no encontrada" }
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: fase, message: "Fase actualizada" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("ticket_fases").doc(id)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Fase no encontrada" }

      const now = new Date().toISOString()
      const updatePayload: Record<string, unknown> = { ...safeInput, updated_at: now }

      if (safeInput.estado === "en_progreso" && !safeInput.fecha_inicio_real) {
        updatePayload.fecha_inicio_real = now
      }
      if (safeInput.estado === "completada") {
        updatePayload.fecha_fin_real = now
        updatePayload.progreso_porcentaje = 100
      }

      await ref.update(cleanForFirestore(updatePayload))
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return {
        success: true,
        data: fromFirestoreDoc<TicketFase>(id, { ...snap.data()!, ...updatePayload }),
        message: "Fase actualizada",
      }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return { success: false, error: "Fases requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR FASE (Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteFase(id: string, ticketId: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos para eliminar fases" }

  if (isLocalMode()) {
    const deleted = deleteDemoFase(id)
    if (!deleted) return { success: false, error: "Fase no encontrada" }
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, message: "Fase eliminada" }
  }

  if (isFirebaseMode()) {
    try {
      await getAdminFirestore().collection("ticket_fases").doc(id).delete()
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, message: "Fase eliminada" }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }

  return { success: false, error: "Fases requiere configuración Firebase válida" }
}
