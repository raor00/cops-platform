"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoDashboardStats, getDemoEnhancedStats } from "@/lib/mock-data"
import type { ActionResponse, ChangeType, DashboardStats, EnhancedDashboardStats, TechnicianStats, Ticket, TicketStatus, TicketPriority, User } from "@/types"
import { canViewAllTickets } from "@/types"

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "No autorizado" }
  }

  if (isLocalMode()) {
    return { success: true, data: getDemoDashboardStats(user) }
  }

  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Query base - si es técnico, solo sus tickets
  const baseFilter = !canViewAllTickets(user.rol) 
    ? { tecnico_id: user.id } 
    : {}

  // Total de tickets
  const { count: ticketsTotal } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .match(baseFilter)

  // Tickets de hoy
  const { count: ticketsHoy } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .match(baseFilter)
    .gte("created_at", today.toISOString())

  // Tickets pendientes (no finalizados ni cancelados)
  const { count: ticketsPendientes } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .match(baseFilter)
    .not("estado", "in", '("finalizado","cancelado")')

  // Tickets finalizados
  const { count: ticketsFinalizados } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .match(baseFilter)
    .eq("estado", "finalizado")

  // Pagos pendientes (solo para gerentes+)
  let pagosPendientes = 0
  let montosPendientes = 0

  if (canViewAllTickets(user.rol)) {
    const { data: pagos } = await supabase
      .from("pagos_tecnicos")
      .select("monto_a_pagar")
      .eq("estado_pago", "pendiente")

    if (pagos) {
      pagosPendientes = pagos.length
      montosPendientes = pagos.reduce((sum, p) => sum + Number(p.monto_a_pagar), 0)
    }
  }

  // Tickets por estado
  const ticketsPorEstado: Record<TicketStatus, number> = {
    asignado: 0,
    iniciado: 0,
    en_progreso: 0,
    finalizado: 0,
    cancelado: 0,
  }

  const estados: TicketStatus[] = ['asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado']
  for (const estado of estados) {
    const { count } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .match(baseFilter)
      .eq("estado", estado)
    ticketsPorEstado[estado] = count || 0
  }

  // Tickets por prioridad
  const ticketsPorPrioridad: Record<TicketPriority, number> = {
    baja: 0,
    media: 0,
    alta: 0,
    urgente: 0,
  }

  const prioridades: TicketPriority[] = ['baja', 'media', 'alta', 'urgente']
  for (const prioridad of prioridades) {
    const { count } = await supabase
      .from("tickets")
      .select("*", { count: "exact", head: true })
      .match(baseFilter)
      .eq("prioridad", prioridad)
      .not("estado", "in", '("finalizado","cancelado")')
    ticketsPorPrioridad[prioridad] = count || 0
  }

  return {
    success: true,
    data: {
      ticketsTotal: ticketsTotal || 0,
      ticketsHoy: ticketsHoy || 0,
      ticketsPendientes: ticketsPendientes || 0,
      ticketsFinalizados: ticketsFinalizados || 0,
      pagosPendientes,
      montosPendientes,
      ticketsPorEstado,
      ticketsPorPrioridad,
    },
  }
}

export async function getTechnicianStats(tecnicoId?: string): Promise<ActionResponse<TechnicianStats>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "No autorizado" }
  }

  const targetId = tecnicoId || user.id
  const supabase = await createClient()

  // Verificar permisos
  if (user.id !== targetId && !canViewAllTickets(user.rol)) {
    return { success: false, error: "No autorizado" }
  }

  // Tickets asignados
  const { count: ticketsAsignados } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("tecnico_id", targetId)

  // Tickets completados
  const { count: ticketsCompletados } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("tecnico_id", targetId)
    .eq("estado", "finalizado")

  // Tickets en progreso
  const { count: ticketsEnProgreso } = await supabase
    .from("tickets")
    .select("*", { count: "exact", head: true })
    .eq("tecnico_id", targetId)
    .not("estado", "in", '("finalizado","cancelado")')

  // Pagos pendientes
  const { data: pagos } = await supabase
    .from("pagos_tecnicos")
    .select("monto_a_pagar")
    .eq("tecnico_id", targetId)
    .eq("estado_pago", "pendiente")

  const pagosPendientes = pagos?.length || 0
  const montoPendiente = pagos?.reduce((sum, p) => sum + Number(p.monto_a_pagar), 0) || 0

  // Tiempo promedio de trabajo
  const { data: ticketsConTiempo } = await supabase
    .from("tickets")
    .select("tiempo_trabajado")
    .eq("tecnico_id", targetId)
    .eq("estado", "finalizado")
    .not("tiempo_trabajado", "is", null)

  const tiempoPromedioMinutos = ticketsConTiempo && ticketsConTiempo.length > 0
    ? ticketsConTiempo.reduce((sum, t) => sum + (t.tiempo_trabajado || 0), 0) / ticketsConTiempo.length
    : 0

  return {
    success: true,
    data: {
      ticketsAsignados: ticketsAsignados || 0,
      ticketsCompletados: ticketsCompletados || 0,
      ticketsEnProgreso: ticketsEnProgreso || 0,
      pagosPendientes,
      montoPendiente,
      tiempoPromedioMinutos: Math.round(tiempoPromedioMinutos),
    },
  }
}

export async function getRecentTickets(limit = 5): Promise<ActionResponse<unknown[]>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "No autorizado" }
  }

  const supabase = await createClient()

  let query = supabase
    .from("tickets")
    .select(`
      id,
      numero_ticket,
      tipo,
      cliente_nombre,
      asunto,
      estado,
      prioridad,
      created_at,
      tecnico:users!tickets_tecnico_id_fkey(id, nombre, apellido)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!canViewAllTickets(user.rol)) {
    query = query.eq("tecnico_id", user.id)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data: data || [] }
}

export async function getEnhancedDashboardStats(): Promise<ActionResponse<EnhancedDashboardStats>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "No autorizado" }
  }

  if (isLocalMode()) {
    return { success: true, data: getDemoEnhancedStats(user) }
  }

  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const baseFilter = !canViewAllTickets(user.rol) ? { tecnico_id: user.id } : {}

  // Base stats
  const baseResult = await getDashboardStats()
  if (!baseResult.success || !baseResult.data) {
    return { success: false, error: baseResult.error || "Error al cargar estadísticas" }
  }

  // Revenue metrics
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { data: ingresosTotal } = await supabase
    .from("tickets")
    .select("monto_servicio")
    .eq("estado", "finalizado")

  const { data: ingresosEsteMes } = await supabase
    .from("tickets")
    .select("monto_servicio")
    .eq("estado", "finalizado")
    .gte("fecha_finalizacion", inicioMes.toISOString())

  const { data: pagosPendientesData } = await supabase
    .from("pagos_tecnicos")
    .select("monto_a_pagar")
    .eq("estado_pago", "pendiente")

  // Technician KPIs
  const { data: tecnicos } = await supabase
    .from("users")
    .select("id, nombre, apellido")
    .eq("rol", "tecnico")
    .eq("estado", "activo")

  const technicianKPIs = await Promise.all(
    (tecnicos || []).map(async (tec) => {
      const { count: completados } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("tecnico_id", tec.id)
        .eq("estado", "finalizado")

      const { count: activos } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("tecnico_id", tec.id)
        .not("estado", "in", '("finalizado","cancelado")')

      const { data: tiempos } = await supabase
        .from("tickets")
        .select("tiempo_trabajado")
        .eq("tecnico_id", tec.id)
        .eq("estado", "finalizado")
        .not("tiempo_trabajado", "is", null)

      const { data: montos } = await supabase
        .from("tickets")
        .select("monto_servicio")
        .eq("tecnico_id", tec.id)
        .eq("estado", "finalizado")

      const { data: pendientePago } = await supabase
        .from("pagos_tecnicos")
        .select("monto_a_pagar")
        .eq("tecnico_id", tec.id)
        .eq("estado_pago", "pendiente")

      const tiempoArr = (tiempos || []).map((t) => t.tiempo_trabajado || 0)
      const tiempoPromedio = tiempoArr.length > 0 ? Math.round(tiempoArr.reduce((a, b) => a + b, 0) / tiempoArr.length) : 0

      return {
        id: tec.id,
        nombre: tec.nombre,
        apellido: tec.apellido,
        ticketsCompletados: completados || 0,
        ticketsActivos: activos || 0,
        tiempoPromedioMinutos: tiempoPromedio,
        montoTotal: (montos || []).reduce((sum, m) => sum + Number(m.monto_servicio), 0),
        montoPendiente: (pendientePago || []).reduce((sum, p) => sum + Number(p.monto_a_pagar), 0),
      }
    })
  )

  // Tickets por mes (últimos 6 meses)
  const ticketsPorMes = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const start = new Date()
      start.setMonth(start.getMonth() - (5 - i))
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      const mes = start.toLocaleDateString("es-VE", { month: "short", year: "2-digit" })

      const { count: servicios } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "servicio")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())

      const { count: proyectos } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("tipo", "proyecto")
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString())

      const { count: finalizados } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .eq("estado", "finalizado")
        .gte("fecha_finalizacion", start.toISOString())
        .lt("fecha_finalizacion", end.toISOString())

      return { mes, servicios: servicios || 0, proyectos: proyectos || 0, finalizados: finalizados || 0 }
    })
  )

  // Activity feed (last 10 entries)
  const { data: historial } = await supabase
    .from("historial_cambios")
    .select(`
      id, tipo_cambio, campo_modificado, valor_nuevo, created_at,
      usuario:users!historial_cambios_usuario_id_fkey(nombre, apellido),
      ticket:tickets!historial_cambios_ticket_id_fkey(numero_ticket)
    `)
    .order("created_at", { ascending: false })
    .limit(10)

  const actividadReciente = (historial || []).map((h) => {
    const row = h as unknown as {
      id: string
      tipo_cambio: ChangeType
      campo_modificado: string | null
      created_at: string
      usuario: { nombre: string; apellido: string } | null
      ticket: { numero_ticket: string } | null
    }
    return {
      id: row.id,
      tipo: row.tipo_cambio,
      descripcion: row.campo_modificado ? `Campo "${row.campo_modificado}" actualizado` : "Ticket actualizado",
      usuario: row.usuario ? `${row.usuario.nombre} ${row.usuario.apellido}` : "Sistema",
      fecha: row.created_at,
      ticket_numero: row.ticket?.numero_ticket ?? null,
    }
  })

  return {
    success: true,
    data: {
      ...baseResult.data,
      ingresoTotal: (ingresosTotal || []).reduce((sum, t) => sum + Number(t.monto_servicio), 0),
      ingresoPendiente: (pagosPendientesData || []).reduce((sum, p) => sum + Number(p.monto_a_pagar), 0),
      ingresoEsteMes: (ingresosEsteMes || []).reduce((sum, t) => sum + Number(t.monto_servicio), 0),
      technicianKPIs,
      ticketsPorMes,
      actividadReciente,
    },
  }
}
