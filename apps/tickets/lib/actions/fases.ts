"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  FaseCreateInput,
  FaseUpdateInput,
  TicketFase,
} from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import {
  getDemoFasesByTicket,
  createDemoFase,
  updateDemoFase,
  deleteDemoFase,
} from "@/lib/mock-data"

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER FASES DE UN TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function getFasesByTicket(ticketId: string): Promise<ActionResponse<TicketFase[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoFasesByTicket(ticketId) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("ticket_fases")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("orden", { ascending: true })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as TicketFase[] }
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

  const supabase = await createClient()

  // Obtener el siguiente orden
  const { data: existing } = await supabase
    .from("ticket_fases")
    .select("orden")
    .eq("ticket_id", input.ticket_id)
    .order("orden", { ascending: false })
    .limit(1)

  const nextOrden = existing && existing.length > 0 ? (existing[0]!.orden as number) + 1 : 1

  const { data, error } = await supabase
    .from("ticket_fases")
    .insert({
      ticket_id: input.ticket_id,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      orden: input.orden ?? nextOrden,
      estado: "pendiente",
      progreso_porcentaje: 0,
      fecha_inicio_estimada: input.fecha_inicio_estimada || null,
      fecha_fin_estimada: input.fecha_fin_estimada || null,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/tickets/${input.ticket_id}`)
  return { success: true, data: data as TicketFase, message: "Fase creada exitosamente" }
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

  const supabase = await createClient()

  const updatePayload: Record<string, unknown> = { ...safeInput, updated_at: new Date().toISOString() }

  // Auto-completar fechas según estado
  if (safeInput.estado === "en_progreso" && !safeInput.fecha_inicio_real) {
    updatePayload.fecha_inicio_real = new Date().toISOString()
  }
  if (safeInput.estado === "completada") {
    updatePayload.fecha_fin_real = new Date().toISOString()
    updatePayload.progreso_porcentaje = 100
  }

  const { data, error } = await supabase
    .from("ticket_fases")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return { success: true, data: data as TicketFase, message: "Fase actualizada" }
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

  const supabase = await createClient()
  const { error } = await supabase.from("ticket_fases").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return { success: true, message: "Fase eliminada" }
}
