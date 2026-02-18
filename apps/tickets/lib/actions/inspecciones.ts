"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { ActionResponse, Inspeccion, InspeccionCreateInput } from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER INSPECCIÓN POR TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function getInspeccionByTicket(
  ticketId: string
): Promise<ActionResponse<Inspeccion | null>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: null }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("inspecciones")
    .select(`
      *,
      tecnico:users!inspecciones_realizado_por_fkey(id, nombre, apellido, cedula, rol)
    `)
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    return { success: false, error: error.message }
  }

  return { success: true, data: data as Inspeccion | null }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR INSPECCIÓN
// ─────────────────────────────────────────────────────────────────────────────

export async function createInspeccion(
  ticketId: string,
  input: InspeccionCreateInput
): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) {
    return { success: false, error: "Sin permisos para crear inspecciones" }
  }

  if (isLocalMode()) {
    return {
      success: false,
      error: "Modo local no soporta creación de inspecciones"
    }
  }

  const supabase = await createClient()

  // Verificar si ya existe una inspección para este ticket
  const { data: existing } = await supabase
    .from("inspecciones")
    .select("id")
    .eq("ticket_id", ticketId)
    .single()

  if (existing) {
    return {
      success: false,
      error: "Ya existe una inspección para este ticket"
    }
  }

  const { data, error } = await supabase
    .from("inspecciones")
    .insert({
      ticket_id: ticketId,
      realizado_por: currentUser.id,
      fecha_inspeccion: new Date().toISOString(),
      datos_checklist: input.datos_checklist,
      observaciones_generales: input.observaciones_generales || null,
      recomendaciones: input.recomendaciones || null,
      materiales_requeridos: input.materiales_requeridos || [],
      estado: "borrador",
    })
    .select(`
      *,
      tecnico:users!inspecciones_realizado_por_fkey(id, nombre, apellido, cedula, rol)
    `)
    .single()

  if (error) return { success: false, error: error.message }

  // Registrar en historial
  await supabase.from("historial_cambios").insert({
    ticket_id: ticketId,
    usuario_id: currentUser.id,
    tipo_cambio: "inspeccion",
    descripcion: "Inspección técnica creada",
  })

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return {
    success: true,
    data: data as Inspeccion,
    message: "Inspección creada exitosamente"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR INSPECCIÓN
// ─────────────────────────────────────────────────────────────────────────────

export async function updateInspeccion(
  inspeccionId: string,
  input: Partial<InspeccionCreateInput>
): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) {
    return { success: false, error: "Sin permisos para actualizar inspecciones" }
  }

  if (isLocalMode()) {
    return {
      success: false,
      error: "Modo local no soporta actualización de inspecciones"
    }
  }

  const supabase = await createClient()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.datos_checklist !== undefined) {
    updateData.datos_checklist = input.datos_checklist
  }
  if (input.observaciones_generales !== undefined) {
    updateData.observaciones_generales = input.observaciones_generales
  }
  if (input.recomendaciones !== undefined) {
    updateData.recomendaciones = input.recomendaciones
  }
  if (input.materiales_requeridos !== undefined) {
    updateData.materiales_requeridos = input.materiales_requeridos
  }

  const { data, error } = await supabase
    .from("inspecciones")
    .update(updateData)
    .eq("id", inspeccionId)
    .select(`
      *,
      tecnico:users!inspecciones_realizado_por_fkey(id, nombre, apellido, cedula, rol)
    `)
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/tickets/${data.ticket_id}`)
  return {
    success: true,
    data: data as Inspeccion,
    message: "Inspección actualizada exitosamente"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETAR INSPECCIÓN
// ─────────────────────────────────────────────────────────────────────────────

export async function completarInspeccion(
  inspeccionId: string
): Promise<ActionResponse<Inspeccion>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) {
    return { success: false, error: "Sin permisos para completar inspecciones" }
  }

  if (isLocalMode()) {
    return {
      success: false,
      error: "Modo local no soporta completar inspecciones"
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("inspecciones")
    .update({
      estado: "completada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", inspeccionId)
    .eq("estado", "borrador")
    .select(`
      *,
      tecnico:users!inspecciones_realizado_por_fkey(id, nombre, apellido, cedula, rol)
    `)
    .single()

  if (error) return { success: false, error: error.message }
  if (!data) {
    return {
      success: false,
      error: "Inspección no encontrada o ya completada"
    }
  }

  // Registrar en historial
  await supabase.from("historial_cambios").insert({
    ticket_id: data.ticket_id,
    usuario_id: currentUser.id,
    tipo_cambio: "inspeccion",
    descripcion: "Inspección técnica completada",
  })

  revalidatePath(`/dashboard/tickets/${data.ticket_id}`)
  return {
    success: true,
    data: data as Inspeccion,
    message: "Inspección completada exitosamente"
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR INSPECCIÓN
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteInspeccion(
  inspeccionId: string
): Promise<ActionResponse<void>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { success: false, error: "Sin permisos para eliminar inspecciones" }
  }

  if (isLocalMode()) {
    return {
      success: false,
      error: "Modo local no soporta eliminar inspecciones"
    }
  }

  const supabase = await createClient()

  // Obtener el ticket_id antes de eliminar
  const { data: inspeccion } = await supabase
    .from("inspecciones")
    .select("ticket_id")
    .eq("id", inspeccionId)
    .single()

  if (!inspeccion) {
    return { success: false, error: "Inspección no encontrada" }
  }

  const { error } = await supabase
    .from("inspecciones")
    .delete()
    .eq("id", inspeccionId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/tickets/${inspeccion.ticket_id}`)
  return { success: true, message: "Inspección eliminada exitosamente" }
}
