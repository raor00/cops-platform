"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  ChangeHistory,
  Ticket,
  TicketCreateInput,
  TicketUpdateInput,
  TicketStatus,
  PaginatedResponse,
  DashboardStats,
  UpdateLog,
} from "@/types"
import {
  ROLE_HIERARCHY,
  VALID_TRANSITIONS,
  ADMIN_REVERSE_TRANSITIONS,
  generateTicketNumber,
  DEFAULT_SERVICE_AMOUNT,
  DEFAULT_COMMISSION_PERCENTAGE,
} from "@/types"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import {
  assignDemoTechnician,
  changeDemoTicketStatus as changeDemoTicketStatusMock,
  createDemoTicket,
  deleteDemoTicket,
  getDemoDashboardStats,
  getDemoTechnicians,
  getDemoTicketById,
  getDemoTicketsPage,
  updateDemoTicket,
  getDemoUpdateLogs,
  addDemoUpdateLog,
} from "@/lib/mock-data"

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER TICKETS
// ─────────────────────────────────────────────────────────────────────────────

export async function getTickets(options?: {
  page?: number
  pageSize?: number
  status?: TicketStatus
  priority?: string
  tecnicoId?: string
  search?: string
}): Promise<ActionResponse<PaginatedResponse<Ticket>>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (isLocalMode()) {
    return {
      success: true,
      data: getDemoTicketsPage(options, currentUser),
    }
  }

  const supabase = await createClient()

  const page = options?.page || 1
  const pageSize = options?.pageSize || 10
  const offset = (page - 1) * pageSize

  let query = supabase
    .from("tickets")
    .select(`
      *,
      creador:users!tickets_creado_por_fkey(id, nombre, apellido, email),
      tecnico:users!tickets_tecnico_id_fkey(id, nombre, apellido, email),
      modificador:users!tickets_modificado_por_fkey(id, nombre, apellido)
    `, { count: "exact" })

  // Filtrar por rol - técnicos solo ven sus tickets
  if (currentUser.rol === "tecnico") {
    query = query.eq("tecnico_id", currentUser.id)
  }

  // Filtros opcionales
  if (options?.status) {
    query = query.eq("estado", options.status)
  }
  if (options?.priority) {
    query = query.eq("prioridad", options.priority)
  }
  if (options?.tecnicoId) {
    query = query.eq("tecnico_id", options.tecnicoId)
  }
  if (options?.search) {
    query = query.or(`numero_ticket.ilike.%${options.search}%,cliente_nombre.ilike.%${options.search}%,asunto.ilike.%${options.search}%`)
  }

  // Ordenar y paginar
  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  return {
    success: true,
    data: {
      data: data as Ticket[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

export async function getTicketById(id: string): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(id, currentUser)
    if (!ticket) {
      return { success: false, error: "Ticket no encontrado" }
    }

    return { success: true, data: ticket }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tickets")
    .select(`
      *,
      creador:users!tickets_creado_por_fkey(id, nombre, apellido, email, rol),
      tecnico:users!tickets_tecnico_id_fkey(id, nombre, apellido, email, telefono),
      modificador:users!tickets_modificado_por_fkey(id, nombre, apellido)
    `)
    .eq("id", id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Verificar permisos - técnico solo puede ver sus tickets
  if (currentUser.rol === "tecnico" && data.tecnico_id !== currentUser.id) {
    return { success: false, error: "No tienes permiso para ver este ticket" }
  }

  return { success: true, data: data as Ticket }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function createTicket(
  input: TicketCreateInput
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  // Verificar permisos - Coordinador o superior puede crear
  if (ROLE_HIERARCHY[currentUser.rol] < 2) {
    return { success: false, error: "No tienes permisos para crear tickets" }
  }

  if (isLocalMode()) {
    const ticket = createDemoTicket(input, currentUser)

    revalidatePath("/dashboard/tickets")
    revalidatePath("/dashboard")

    return {
      success: true,
      data: ticket,
      message: `Ticket ${ticket.numero_ticket} creado exitosamente`,
    }
  }

  const supabase = await createClient()

  // Obtener el siguiente número de secuencia
  const { data: lastTicket } = await supabase
    .from("tickets")
    .select("numero_ticket")
    .eq("tipo", input.tipo)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  let sequence = 1
  if (lastTicket) {
    const match = lastTicket.numero_ticket.match(/\d{4}$/)
    if (match) {
      sequence = parseInt(match[0]) + 1
    }
  }

  const numeroTicket = generateTicketNumber(input.tipo, sequence)

  // Crear el ticket
  const { data, error } = await supabase
    .from("tickets")
    .insert({
      numero_ticket: numeroTicket,
      tipo: input.tipo,
      cliente_nombre: input.cliente_nombre,
      cliente_empresa: input.cliente_empresa || null,
      cliente_email: input.cliente_email || null,
      cliente_telefono: input.cliente_telefono,
      cliente_direccion: input.cliente_direccion,
      asunto: input.asunto,
      descripcion: input.descripcion,
      requerimientos: input.requerimientos,
      materiales_planificados: input.materiales_planificados || null,
      prioridad: input.prioridad,
      origen: input.origen,
      creado_por: currentUser.id,
      tecnico_id: input.tecnico_id || null,
      estado: "asignado",
      fecha_asignacion: new Date().toISOString(),
      monto_servicio: input.monto_servicio || DEFAULT_SERVICE_AMOUNT,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Registrar en historial
  await supabase.from("historial_cambios").insert({
    ticket_id: data.id,
    usuario_id: currentUser.id,
    tipo_cambio: "creacion",
    valor_nuevo: JSON.stringify({ numero_ticket: numeroTicket, tipo: input.tipo }),
    observacion: `Ticket creado: ${input.asunto}`,
  })

  revalidatePath("/dashboard/tickets")
  revalidatePath("/dashboard")

  return {
    success: true,
    data: data as Ticket,
    message: `Ticket ${numeroTicket} creado exitosamente`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR TICKET (Solo Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTicket(
  id: string,
  input: TicketUpdateInput
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  // REGLA CRÍTICA: Solo nivel 3+ puede modificar tickets
  if (ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { 
      success: false, 
      error: "Solo Gerente, Vicepresidente o Presidente pueden modificar tickets" 
    }
  }

  if (isLocalMode()) {
    const updatedTicket = updateDemoTicket(id, input, currentUser)
    if (!updatedTicket) {
      return { success: false, error: "Ticket no encontrado" }
    }

    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${id}`)

    return {
      success: true,
      data: updatedTicket,
      message: "Ticket actualizado exitosamente",
    }
  }

  const supabase = await createClient()

  // Obtener ticket actual para comparar cambios
  const { data: currentTicket, error: fetchError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !currentTicket) {
    return { success: false, error: "Ticket no encontrado" }
  }

  // Actualizar ticket
  const { data, error } = await supabase
    .from("tickets")
    .update({
      ...input,
      modificado_por: currentUser.id,
      fecha_ultima_modificacion: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Registrar cambios en historial
  const changedFields = Object.keys(input).filter(
    (key) => input[key as keyof TicketUpdateInput] !== currentTicket[key as keyof typeof currentTicket]
  )

  for (const field of changedFields) {
    await supabase.from("historial_cambios").insert({
      ticket_id: id,
      usuario_id: currentUser.id,
      tipo_cambio: "modificacion",
      campo_modificado: field,
      valor_anterior: String(currentTicket[field as keyof typeof currentTicket] || ""),
      valor_nuevo: String(input[field as keyof TicketUpdateInput] || ""),
    })
  }

  revalidatePath("/dashboard/tickets")
  revalidatePath(`/dashboard/tickets/${id}`)

  return {
    success: true,
    data: data as Ticket,
    message: "Ticket actualizado exitosamente",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMBIAR ESTADO (Máquina de Estados)
// ─────────────────────────────────────────────────────────────────────────────

export async function changeTicketStatus(
  id: string,
  newStatus: TicketStatus,
  additionalData?: {
    materiales_usados?: Array<{ id: string; nombre: string; cantidad: number; unidad: string }>
    tiempo_trabajado?: number
    observaciones_tecnico?: string
    solucion_aplicada?: string
  }
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (isLocalMode()) {
    const currentTicket = getDemoTicketById(id, currentUser)
    if (!currentTicket) {
      return { success: false, error: "Ticket no encontrado" }
    }

    if (currentUser.rol === "tecnico" && currentTicket.tecnico_id !== currentUser.id) {
      return { success: false, error: "No tienes permiso para modificar este ticket" }
    }

    const result = changeDemoTicketStatusMock(id, newStatus, additionalData, currentUser.rol)

    if (result.error || !result.ticket) {
      return { success: false, error: result.error || "No se pudo actualizar el ticket" }
    }

    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${id}`)
    revalidatePath("/dashboard/pagos")

    return {
      success: true,
      data: result.ticket,
      message: `Estado cambiado a ${newStatus}`,
    }
  }

  const supabase = await createClient()

  // Obtener ticket actual
  const { data: ticket, error: fetchError } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single()

  if (fetchError || !ticket) {
    return { success: false, error: "Ticket no encontrado" }
  }

  // Verificar permisos - técnico solo puede cambiar sus propios tickets
  if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) {
    return { success: false, error: "No tienes permiso para modificar este ticket" }
  }

  // Validar transición de estado (bidireccional para admin)
  const isAdmin = ROLE_HIERARCHY[currentUser.rol] >= 3
  const forwardOk = VALID_TRANSITIONS[ticket.estado as TicketStatus].includes(newStatus)
  const reverseOk = isAdmin && ADMIN_REVERSE_TRANSITIONS[ticket.estado as TicketStatus].includes(newStatus)
  if (!forwardOk && !reverseOk) {
    return {
      success: false,
      error: `No se puede cambiar de ${ticket.estado} a ${newStatus}`
    }
  }

  // Preparar datos de actualización
  const updateData: Record<string, unknown> = {
    estado: newStatus,
  }

  // Agregar fechas según el estado
  if (newStatus === "iniciado" && !ticket.fecha_inicio) {
    updateData.fecha_inicio = new Date().toISOString()
  }
  if (newStatus === "finalizado") {
    updateData.fecha_finalizacion = new Date().toISOString()
  }

  // Agregar datos adicionales del técnico
  if (additionalData) {
    if (additionalData.materiales_usados) {
      updateData.materiales_usados = additionalData.materiales_usados
    }
    if (additionalData.tiempo_trabajado !== undefined) {
      updateData.tiempo_trabajado = additionalData.tiempo_trabajado
    }
    if (additionalData.observaciones_tecnico) {
      updateData.observaciones_tecnico = additionalData.observaciones_tecnico
    }
    if (additionalData.solucion_aplicada) {
      updateData.solucion_aplicada = additionalData.solucion_aplicada
    }
  }

  // Actualizar ticket
  const { data, error } = await supabase
    .from("tickets")
    .update(updateData)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Registrar cambio de estado en historial
  await supabase.from("historial_cambios").insert({
    ticket_id: id,
    usuario_id: currentUser.id,
    tipo_cambio: "cambio_estado",
    campo_modificado: "estado",
    valor_anterior: ticket.estado,
    valor_nuevo: newStatus,
    observacion: additionalData?.observaciones_tecnico || null,
  })

  // Si el ticket se finaliza, crear registro de pago pendiente
  if (newStatus === "finalizado" && ticket.tecnico_id) {
    const montoAPagar = ticket.monto_servicio * (DEFAULT_COMMISSION_PERCENTAGE / 100)
    
    await supabase.from("pagos_tecnicos").insert({
      ticket_id: id,
      tecnico_id: ticket.tecnico_id,
      monto_ticket: ticket.monto_servicio,
      porcentaje_comision: DEFAULT_COMMISSION_PERCENTAGE,
      monto_a_pagar: montoAPagar,
      estado_pago: "pendiente",
      fecha_habilitacion: new Date().toISOString(),
    })
  }

  revalidatePath("/dashboard/tickets")
  revalidatePath(`/dashboard/tickets/${id}`)
  revalidatePath("/dashboard/pagos")

  return {
    success: true,
    data: data as Ticket,
    message: `Estado cambiado a ${newStatus}`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASIGNAR TÉCNICO
// ─────────────────────────────────────────────────────────────────────────────

export async function assignTechnician(
  ticketId: string,
  tecnicoId: string
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) {
      return { success: false, error: "Ticket no encontrado" }
    }

    const isReassignment = ticket.tecnico_id !== null

    if (isReassignment && ROLE_HIERARCHY[currentUser.rol] < 3) {
      return {
        success: false,
        error: "Solo Gerente o superior puede reasignar tecnicos",
      }
    }

    if (!isReassignment && ROLE_HIERARCHY[currentUser.rol] < 2) {
      return {
        success: false,
        error: "No tienes permisos para asignar tecnicos",
      }
    }

    const updatedTicket = assignDemoTechnician(ticketId, tecnicoId)
    if (!updatedTicket) {
      return { success: false, error: "Tecnico no encontrado" }
    }

    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${ticketId}`)

    return {
      success: true,
      data: updatedTicket,
      message: isReassignment ? "Tecnico reasignado" : "Tecnico asignado",
    }
  }

  const supabase = await createClient()

  // Coordinador puede asignar, pero no reasignar
  // Gerente+ puede reasignar
  const { data: ticket, error: fetchError } = await supabase
    .from("tickets")
    .select("tecnico_id, estado")
    .eq("id", ticketId)
    .single()

  if (fetchError || !ticket) {
    return { success: false, error: "Ticket no encontrado" }
  }

  const isReassignment = ticket.tecnico_id !== null
  
  if (isReassignment && ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { 
      success: false, 
      error: "Solo Gerente o superior puede reasignar técnicos" 
    }
  }

  if (!isReassignment && ROLE_HIERARCHY[currentUser.rol] < 2) {
    return { 
      success: false, 
      error: "No tienes permisos para asignar técnicos" 
    }
  }

  const { data, error } = await supabase
    .from("tickets")
    .update({
      tecnico_id: tecnicoId,
      fecha_asignacion: new Date().toISOString(),
    })
    .eq("id", ticketId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Registrar en historial
  await supabase.from("historial_cambios").insert({
    ticket_id: ticketId,
    usuario_id: currentUser.id,
    tipo_cambio: "asignacion",
    campo_modificado: "tecnico_id",
    valor_anterior: ticket.tecnico_id || "Sin asignar",
    valor_nuevo: tecnicoId,
  })

  revalidatePath("/dashboard/tickets")
  revalidatePath(`/dashboard/tickets/${ticketId}`)

  return {
    success: true,
    data: data as Ticket,
    message: isReassignment ? "Técnico reasignado" : "Técnico asignado",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR TICKET (Solo Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteTicket(id: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (ROLE_HIERARCHY[currentUser.rol] < 3) {
    return { success: false, error: "No tienes permisos para eliminar tickets" }
  }

  if (isLocalMode()) {
    const deleted = deleteDemoTicket(id)
    if (!deleted) {
      return { success: false, error: "Ticket no encontrado" }
    }

    revalidatePath("/dashboard/tickets")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Ticket eliminado exitosamente",
    }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("tickets")
    .delete()
    .eq("id", id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/tickets")
  revalidatePath("/dashboard")

  return {
    success: true,
    message: "Ticket eliminado exitosamente",
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTADÍSTICAS DEL DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "No autenticado" }
  }

  if (isLocalMode()) {
    return {
      success: true,
      data: getDemoDashboardStats(currentUser),
    }
  }

  const supabase = await createClient()

  // Query base
  let ticketsQuery = supabase.from("tickets").select("estado, prioridad, created_at")
  
  // Si es técnico, solo sus tickets
  if (currentUser.rol === "tecnico") {
    ticketsQuery = ticketsQuery.eq("tecnico_id", currentUser.id)
  }

  const { data: tickets, error } = await ticketsQuery

  if (error) {
    return { success: false, error: error.message }
  }

  // Calcular estadísticas
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const stats: DashboardStats = {
    ticketsTotal: tickets?.length || 0,
    ticketsHoy: tickets?.filter(t => new Date(t.created_at) >= today).length || 0,
    ticketsPendientes: tickets?.filter(t => !["finalizado", "cancelado"].includes(t.estado)).length || 0,
    ticketsFinalizados: tickets?.filter(t => t.estado === "finalizado").length || 0,
    pagosPendientes: 0,
    montosPendientes: 0,
    ticketsPorEstado: {
      asignado: tickets?.filter(t => t.estado === "asignado").length || 0,
      iniciado: tickets?.filter(t => t.estado === "iniciado").length || 0,
      en_progreso: tickets?.filter(t => t.estado === "en_progreso").length || 0,
      finalizado: tickets?.filter(t => t.estado === "finalizado").length || 0,
      cancelado: tickets?.filter(t => t.estado === "cancelado").length || 0,
    },
    ticketsPorPrioridad: {
      baja: tickets?.filter(t => t.prioridad === "baja").length || 0,
      media: tickets?.filter(t => t.prioridad === "media").length || 0,
      alta: tickets?.filter(t => t.prioridad === "alta").length || 0,
      urgente: tickets?.filter(t => t.prioridad === "urgente").length || 0,
    },
  }

  // Si puede ver pagos, obtener estadísticas de pagos
  if (ROLE_HIERARCHY[currentUser.rol] >= 3) {
    const { data: pagos } = await supabase
      .from("pagos_tecnicos")
      .select("monto_a_pagar")
      .eq("estado_pago", "pendiente")

    stats.pagosPendientes = pagos?.length || 0
    stats.montosPendientes = pagos?.reduce((sum, p) => sum + p.monto_a_pagar, 0) || 0
  }

  return { success: true, data: stats }
}

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER TÉCNICOS DISPONIBLES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTechnicians(): Promise<ActionResponse<Array<{ id: string; nombre: string; apellido: string }>>> {
  if (isLocalMode()) {
    return {
      success: true,
      data: getDemoTechnicians(),
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("users")
    .select("id, nombre, apellido")
    .eq("rol", "tecnico")
    .eq("estado", "activo")
    .order("nombre")

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data || [] }
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL DE CAMBIOS DE UN TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketHistory(ticketId: string): Promise<ActionResponse<ChangeHistory[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: [] }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("historial_cambios")
    .select("*, usuario:users(nombre, apellido)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as ChangeHistory[] }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE DE ACTUALIZACIONES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketUpdateLogs(ticketId: string): Promise<ActionResponse<UpdateLog[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoUpdateLogs(ticketId) }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("historial_cambios")
    .select("id, ticket_id, usuario_id, observacion, tipo_cambio, created_at, usuario:users(nombre, apellido, rol)")
    .eq("ticket_id", ticketId)
    .in("tipo_cambio", ["sesion_trabajo", "cambio_estado"])
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return { success: false, error: error.message }

  const logs: UpdateLog[] = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    ticket_id: row.ticket_id as string,
    autor_id: row.usuario_id as string,
    contenido: (row.observacion as string) || (row.tipo_cambio === "cambio_estado" ? "Cambio de estado" : "Actualización"),
    tipo: row.tipo_cambio === "cambio_estado" ? "cambio_estado" : "nota" as "nota" | "cambio_estado",
    created_at: row.created_at as string,
    autor: row.usuario as UpdateLog["autor"],
  }))

  return { success: true, data: logs }
}

export async function addTicketUpdateLog(
  ticketId: string,
  contenido: string
): Promise<ActionResponse<UpdateLog>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (!contenido.trim()) {
    return { success: false, error: "El contenido no puede estar vacío" }
  }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }

    const canAdd =
      currentUser.rol === "tecnico"
        ? ticket.tecnico_id === currentUser.id
        : ROLE_HIERARCHY[currentUser.rol] >= 2

    if (!canAdd) return { success: false, error: "No tienes permiso para agregar actualizaciones" }

    const log = addDemoUpdateLog({
      ticket_id: ticketId,
      autor_id: currentUser.id,
      contenido: contenido.trim(),
      tipo: "nota",
      autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol },
    })

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: log, message: "Actualización agregada" }
  }

  const supabase = await createClient()

  const { data: ticket, error: fetchError } = await supabase
    .from("tickets")
    .select("tecnico_id")
    .eq("id", ticketId)
    .single()

  if (fetchError || !ticket) return { success: false, error: "Ticket no encontrado" }

  const canAdd =
    currentUser.rol === "tecnico"
      ? ticket.tecnico_id === currentUser.id
      : ROLE_HIERARCHY[currentUser.rol] >= 2

  if (!canAdd) return { success: false, error: "No tienes permiso para agregar actualizaciones" }

  const { data, error } = await supabase
    .from("historial_cambios")
    .insert({
      ticket_id: ticketId,
      usuario_id: currentUser.id,
      tipo_cambio: "sesion_trabajo",
      observacion: contenido.trim(),
    })
    .select("id, ticket_id, usuario_id, observacion, tipo_cambio, created_at")
    .single()

  if (error) return { success: false, error: error.message }

  const log: UpdateLog = {
    id: data.id,
    ticket_id: data.ticket_id,
    autor_id: data.usuario_id,
    contenido: data.observacion ?? "",
    tipo: "nota",
    created_at: data.created_at,
    autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol },
  }

  revalidatePath(`/dashboard/tickets/${ticketId}`)
  return { success: true, data: log, message: "Actualización agregada" }
}
