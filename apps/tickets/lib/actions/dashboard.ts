"use server"

import { createClient } from "@/lib/supabase/server"
import { getCurrentUser } from "./auth"

function getTotalElapsedMinutes(ticket: Pick<Ticket, "fecha_inicio" | "fecha_finalizacion">): number {
  if (!ticket.fecha_inicio || !ticket.fecha_finalizacion) return 0
  return Math.max(0, Math.round((new Date(ticket.fecha_finalizacion).getTime() - new Date(ticket.fecha_inicio).getTime()) / 60000))
}
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { getDemoDashboardStats, getDemoEnhancedStats } from "@/lib/mock-data"
import { getAdminFirestore } from "@/lib/firebase/admin"
import type { ActionResponse, ChangeType, DashboardStats, EnhancedDashboardStats, TechnicianStats, Ticket, TicketStatus, TicketPriority, User } from "@/types"
import { canViewAllTickets } from "@/types"

interface RecentTicket {
  id: string
  numero_ticket: string
  tipo: string
  cliente_nombre: string
  asunto: string
  estado: TicketStatus
  prioridad: string
  created_at: string
  tecnico?: { id: string; nombre: string; apellido: string } | null
}

// ─── Firebase helpers ────────────────────────────────────────────────────────

async function fbGetDashboardStats(user: User): Promise<DashboardStats> {
  const db = getAdminFirestore()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const canViewAll = canViewAllTickets(user.rol)

  let query = db.collection("tickets") as FirebaseFirestore.Query
  if (!canViewAll) query = query.where("tecnico_id", "==", user.id)

  const snap = await query.get()
  const tickets = snap.docs.map((d) => d.data() as Ticket)

  const ticketsTotal = tickets.length
  const ticketsHoy = tickets.filter((t) => new Date(t.created_at) >= today).length
  const ticketsPendientes = tickets.filter((t) => t.estado !== "finalizado" && t.estado !== "cancelado").length
  const ticketsFinalizados = tickets.filter((t) => t.estado === "finalizado").length

  let pagosPendientes = 0
  let montosPendientes = 0
  if (canViewAll) {
    const pagosSnap = await db.collection("pagos").where("estado_pago", "==", "pendiente").get()
    pagosPendientes = pagosSnap.size
    montosPendientes = pagosSnap.docs.reduce((sum, d) => sum + Number(d.data().monto_a_pagar || 0), 0)
  }

  const statuses: TicketStatus[] = ["borrador", "asignado", "iniciado", "en_progreso", "finalizado", "cancelado"]
  const ticketsPorEstado = statuses.reduce((acc, s) => {
    acc[s] = tickets.filter((t) => t.estado === s).length
    return acc
  }, {} as Record<TicketStatus, number>)

  const priorities: TicketPriority[] = ["baja", "media", "alta", "urgente"]
  const ticketsPorPrioridad = priorities.reduce((acc, p) => {
    acc[p] = tickets.filter((t) => t.prioridad === p && t.estado !== "finalizado" && t.estado !== "cancelado").length
    return acc
  }, {} as Record<TicketPriority, number>)

  return {
    ticketsTotal,
    ticketsHoy,
    ticketsPendientes,
    ticketsFinalizados,
    pagosPendientes,
    montosPendientes,
    ticketsPorEstado,
    ticketsPorPrioridad,
  }
}

// ─── Exported actions ─────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ActionResponse<DashboardStats>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autorizado" }

  if (isLocalMode()) return { success: true, data: getDemoDashboardStats(user) }

  if (isFirebaseMode()) {
    try {
      return { success: true, data: await fbGetDashboardStats(user) }
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message }
    }
  }

  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const baseFilter = !canViewAllTickets(user.rol) ? { tecnico_id: user.id } : {}

  const { count: ticketsTotal } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter)
  const { count: ticketsHoy } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter).gte("created_at", today.toISOString())
  const { count: ticketsPendientes } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter).not("estado", "in", '("finalizado","cancelado")')
  const { count: ticketsFinalizados } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter).eq("estado", "finalizado")

  let pagosPendientes = 0
  let montosPendientes = 0
  if (canViewAllTickets(user.rol)) {
    const { data: pagos } = await supabase.from("pagos_tecnicos").select("monto_a_pagar").eq("estado_pago", "pendiente")
    if (pagos) {
      pagosPendientes = pagos.length
      montosPendientes = pagos.reduce((sum, p) => sum + Number(p.monto_a_pagar), 0)
    }
  }

  const ticketsPorEstado: Record<TicketStatus, number> = { borrador: 0, asignado: 0, iniciado: 0, en_progreso: 0, finalizado: 0, cancelado: 0 }
  const estados: TicketStatus[] = ["borrador", "asignado", "iniciado", "en_progreso", "finalizado", "cancelado"]
  for (const estado of estados) {
    const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter).eq("estado", estado)
    ticketsPorEstado[estado] = count || 0
  }

  const ticketsPorPrioridad: Record<TicketPriority, number> = { baja: 0, media: 0, alta: 0, urgente: 0 }
  const prioridades: TicketPriority[] = ["baja", "media", "alta", "urgente"]
  for (const prioridad of prioridades) {
    const { count } = await supabase.from("tickets").select("*", { count: "exact", head: true }).match(baseFilter).eq("prioridad", prioridad).not("estado", "in", '("finalizado","cancelado")')
    ticketsPorPrioridad[prioridad] = count || 0
  }

  return {
    success: true,
    data: { ticketsTotal: ticketsTotal || 0, ticketsHoy: ticketsHoy || 0, ticketsPendientes: ticketsPendientes || 0, ticketsFinalizados: ticketsFinalizados || 0, pagosPendientes, montosPendientes, ticketsPorEstado, ticketsPorPrioridad },
  }
}

export async function getTechnicianStats(tecnicoId?: string): Promise<ActionResponse<TechnicianStats>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autorizado" }

  const targetId = tecnicoId || user.id
  if (user.id !== targetId && !canViewAllTickets(user.rol)) return { success: false, error: "No autorizado" }

  if (isLocalMode()) {
    return { success: true, data: { ticketsAsignados: 0, ticketsCompletados: 0, ticketsEnProgreso: 0, pagosPendientes: 0, montoPendiente: 0, tiempoPromedioMinutos: 0, tiempoPromedioTotalMinutos: 0 } }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("tickets").where("tecnico_id", "==", targetId).get()
      const tickets = snap.docs.map((d) => d.data() as Ticket)

      const ticketsAsignados = tickets.length
      const ticketsCompletados = tickets.filter((t) => t.estado === "finalizado").length
      const ticketsEnProgreso = tickets.filter((t) => t.estado !== "finalizado" && t.estado !== "cancelado").length

      const pagosSnap = await db.collection("pagos").where("tecnico_id", "==", targetId).where("estado_pago", "==", "pendiente").get()
      const pagosPendientes = pagosSnap.size
      const montoPendiente = pagosSnap.docs.reduce((sum, d) => sum + Number(d.data().monto_a_pagar || 0), 0)

      const finalizados = tickets.filter((t) => t.estado === "finalizado" && t.tiempo_trabajado)
      const tiempoPromedioMinutos = finalizados.length > 0
        ? Math.round(finalizados.reduce((sum, t) => sum + (t.tiempo_trabajado || 0), 0) / finalizados.length)
        : 0
      const totalFinalizados = tickets.filter((t) => t.estado === "finalizado" && t.fecha_inicio && t.fecha_finalizacion)
      const tiempoPromedioTotalMinutos = totalFinalizados.length > 0
        ? Math.round(totalFinalizados.reduce((sum, t) => sum + getTotalElapsedMinutes(t), 0) / totalFinalizados.length)
        : 0

      return { success: true, data: { ticketsAsignados, ticketsCompletados, ticketsEnProgreso, pagosPendientes, montoPendiente, tiempoPromedioMinutos, tiempoPromedioTotalMinutos } }
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message }
    }
  }

  const supabase = await createClient()

  const { count: ticketsAsignados } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tecnico_id", targetId)
  const { count: ticketsCompletados } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tecnico_id", targetId).eq("estado", "finalizado")
  const { count: ticketsEnProgreso } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tecnico_id", targetId).not("estado", "in", '("finalizado","cancelado")')
  const { data: pagos } = await supabase.from("pagos_tecnicos").select("monto_a_pagar").eq("tecnico_id", targetId).eq("estado_pago", "pendiente")
  const pagosPendientes = pagos?.length || 0
  const montoPendiente = pagos?.reduce((sum, p) => sum + Number(p.monto_a_pagar), 0) || 0
  const { data: ticketsConTiempo } = await supabase.from("tickets").select("tiempo_trabajado").eq("tecnico_id", targetId).eq("estado", "finalizado").not("tiempo_trabajado", "is", null)
  const { data: ticketsConTiempoTotal } = await supabase.from("tickets").select("fecha_inicio, fecha_finalizacion").eq("tecnico_id", targetId).eq("estado", "finalizado").not("fecha_inicio", "is", null).not("fecha_finalizacion", "is", null)
  const tiempoPromedioMinutos = ticketsConTiempo && ticketsConTiempo.length > 0
    ? ticketsConTiempo.reduce((sum, t) => sum + (t.tiempo_trabajado || 0), 0) / ticketsConTiempo.length
    : 0
  const tiempoPromedioTotalMinutos = ticketsConTiempoTotal && ticketsConTiempoTotal.length > 0
    ? ticketsConTiempoTotal.reduce((sum, t) => sum + getTotalElapsedMinutes(t as Ticket), 0) / ticketsConTiempoTotal.length
    : 0

  return { success: true, data: { ticketsAsignados: ticketsAsignados || 0, ticketsCompletados: ticketsCompletados || 0, ticketsEnProgreso: ticketsEnProgreso || 0, pagosPendientes, montoPendiente, tiempoPromedioMinutos: Math.round(tiempoPromedioMinutos), tiempoPromedioTotalMinutos: Math.round(tiempoPromedioTotalMinutos) } }
}

export async function getRecentTickets(limit = 5): Promise<ActionResponse<RecentTicket[]>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autorizado" }

  if (isLocalMode()) return { success: true, data: [] }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      let query = db.collection("tickets").orderBy("created_at", "desc").limit(limit) as FirebaseFirestore.Query
      if (!canViewAllTickets(user.rol)) query = db.collection("tickets").where("tecnico_id", "==", user.id).orderBy("created_at", "desc").limit(limit)

      const snap = await query.get()
      return { success: true, data: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecentTicket) }
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message }
    }
  }

  const supabase = await createClient()
  let query = supabase
    .from("tickets")
    .select(`id, numero_ticket, tipo, cliente_nombre, asunto, estado, prioridad, created_at, tecnico:users!tickets_tecnico_id_fkey(id, nombre, apellido)`)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (!canViewAllTickets(user.rol)) query = query.eq("tecnico_id", user.id)

  const { data, error } = await query
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data ?? []) as unknown as RecentTicket[] }
}

export async function getEnhancedDashboardStats(): Promise<ActionResponse<EnhancedDashboardStats>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autorizado" }

  if (isLocalMode()) return { success: true, data: getDemoEnhancedStats(user) }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const baseData = await fbGetDashboardStats(user)

      const ticketsSnap = await db.collection("tickets").get()
      const allTickets = ticketsSnap.docs.map((d) => d.data() as Ticket)

      const finalizados = allTickets.filter((t) => t.estado === "finalizado")
      const ingresoTotal = finalizados.reduce((sum, t) => sum + Number(t.monto_servicio || 0), 0)

      const inicioMes = new Date()
      inicioMes.setDate(1)
      inicioMes.setHours(0, 0, 0, 0)
      const ingresoEsteMes = finalizados
        .filter((t) => t.fecha_finalizacion && new Date(t.fecha_finalizacion) >= inicioMes)
        .reduce((sum, t) => sum + Number(t.monto_servicio || 0), 0)

      const pagosSnap = await db.collection("pagos").where("estado_pago", "==", "pendiente").get()
      const ingresoPendiente = pagosSnap.docs.reduce((sum, d) => sum + Number(d.data().monto_a_pagar || 0), 0)

      // Technician KPIs
      const tecnicosSnap = await db.collection("users").where("rol", "==", "tecnico").where("estado", "==", "activo").get()
      const technicianKPIs = await Promise.all(
        tecnicosSnap.docs.map(async (tDoc) => {
          const tec = tDoc.data()
          const tTickets = allTickets.filter((t) => t.tecnico_id === tDoc.id)
          const tFinalizados = tTickets.filter((t) => t.estado === "finalizado")
          const tiempos = tFinalizados.filter((t) => t.tiempo_trabajado).map((t) => t.tiempo_trabajado || 0)
          const tiemposTotales = tFinalizados.filter((t) => t.fecha_inicio && t.fecha_finalizacion).map((t) => getTotalElapsedMinutes(t))
          const tPagosSnap = await db.collection("pagos").where("tecnico_id", "==", tDoc.id).where("estado_pago", "==", "pendiente").get()

          return {
            id: tDoc.id,
            nombre: tec.nombre,
            apellido: tec.apellido,
            ticketsCompletados: tFinalizados.length,
            ticketsActivos: tTickets.filter((t) => t.estado !== "finalizado" && t.estado !== "cancelado").length,
            tiempoPromedioMinutos: tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0,
            tiempoPromedioTotalMinutos: tiemposTotales.length > 0 ? Math.round(tiemposTotales.reduce((a, b) => a + b, 0) / tiemposTotales.length) : 0,
            montoTotal: tFinalizados.reduce((sum, t) => sum + Number(t.monto_servicio || 0), 0),
            montoPendiente: tPagosSnap.docs.reduce((sum, d) => sum + Number(d.data().monto_a_pagar || 0), 0),
          }
        })
      )

      // Tickets por mes (últimos 6 meses)
      const ticketsPorMes = Array.from({ length: 6 }, (_, i) => {
        const start = new Date()
        start.setMonth(start.getMonth() - (5 - i))
        start.setDate(1)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setMonth(end.getMonth() + 1)
        const mes = start.toLocaleDateString("es-VE", { month: "short", year: "2-digit" })

        const inRange = allTickets.filter((t) => {
          const d = new Date(t.created_at)
          return d >= start && d < end
        })

        return {
          mes,
          servicios: inRange.filter((t) => t.tipo === "servicio").length,
          proyectos: inRange.filter((t) => t.tipo === "proyecto").length,
          finalizados: inRange.filter((t) => t.estado === "finalizado").length,
        }
      })

      return {
        success: true,
        data: { ...baseData, ingresoTotal, ingresoPendiente, ingresoEsteMes, technicianKPIs, ticketsPorMes, actividadReciente: [] },
      }
    } catch (e: unknown) {
      return { success: false, error: (e as Error).message }
    }
  }

  const supabase = await createClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const baseResult = await getDashboardStats()
  if (!baseResult.success || !baseResult.data) return { success: false, error: baseResult.error || "Error al cargar estadísticas" }

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { data: ingresosTotal } = await supabase.from("tickets").select("monto_servicio").eq("estado", "finalizado")
  const { data: ingresosEsteMes } = await supabase.from("tickets").select("monto_servicio").eq("estado", "finalizado").gte("fecha_finalizacion", inicioMes.toISOString())
  const { data: pagosPendientesData } = await supabase.from("pagos_tecnicos").select("monto_a_pagar").eq("estado_pago", "pendiente")
  const { data: tecnicos } = await supabase.from("users").select("id, nombre, apellido").eq("rol", "tecnico").eq("estado", "activo")

  const technicianKPIs = await Promise.all(
    (tecnicos || []).map(async (tec) => {
      const { count: completados } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tecnico_id", tec.id).eq("estado", "finalizado")
      const { count: activos } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tecnico_id", tec.id).not("estado", "in", '("finalizado","cancelado")')
      const { data: tiempos } = await supabase.from("tickets").select("tiempo_trabajado").eq("tecnico_id", tec.id).eq("estado", "finalizado").not("tiempo_trabajado", "is", null)
      const { data: tiemposTotales } = await supabase.from("tickets").select("fecha_inicio, fecha_finalizacion").eq("tecnico_id", tec.id).eq("estado", "finalizado").not("fecha_inicio", "is", null).not("fecha_finalizacion", "is", null)
      const { data: montos } = await supabase.from("tickets").select("monto_servicio").eq("tecnico_id", tec.id).eq("estado", "finalizado")
      const { data: pendientePago } = await supabase.from("pagos_tecnicos").select("monto_a_pagar").eq("tecnico_id", tec.id).eq("estado_pago", "pendiente")
      const tiempoArr = (tiempos || []).map((t) => t.tiempo_trabajado || 0)
      const tiempoPromedio = tiempoArr.length > 0 ? Math.round(tiempoArr.reduce((a, b) => a + b, 0) / tiempoArr.length) : 0
      const totalPromedio = (tiemposTotales || []).length > 0 ? Math.round((tiemposTotales || []).reduce((sum, t) => sum + getTotalElapsedMinutes(t as Ticket), 0) / (tiemposTotales || []).length) : 0
      return { id: tec.id, nombre: tec.nombre, apellido: tec.apellido, ticketsCompletados: completados || 0, ticketsActivos: activos || 0, tiempoPromedioMinutos: tiempoPromedio, tiempoPromedioTotalMinutos: totalPromedio, montoTotal: (montos || []).reduce((sum, m) => sum + Number(m.monto_servicio), 0), montoPendiente: (pendientePago || []).reduce((sum, p) => sum + Number(p.monto_a_pagar), 0) }
    })
  )

  const ticketsPorMes = await Promise.all(
    Array.from({ length: 6 }, async (_, i) => {
      const start = new Date()
      start.setMonth(start.getMonth() - (5 - i))
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)
      const mes = start.toLocaleDateString("es-VE", { month: "short", year: "2-digit" })
      const { count: servicios } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tipo", "servicio").gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      const { count: proyectos } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("tipo", "proyecto").gte("created_at", start.toISOString()).lt("created_at", end.toISOString())
      const { count: finalizados } = await supabase.from("tickets").select("*", { count: "exact", head: true }).eq("estado", "finalizado").gte("fecha_finalizacion", start.toISOString()).lt("fecha_finalizacion", end.toISOString())
      return { mes, servicios: servicios || 0, proyectos: proyectos || 0, finalizados: finalizados || 0 }
    })
  )

  const { data: historial } = await supabase
    .from("historial_cambios")
    .select(`id, tipo_cambio, campo_modificado, valor_nuevo, created_at, usuario:users!historial_cambios_usuario_id_fkey(nombre, apellido), ticket:tickets!historial_cambios_ticket_id_fkey(numero_ticket)`)
    .order("created_at", { ascending: false })
    .limit(10)

  const actividadReciente = (historial || []).map((h) => {
    const row = h as unknown as { id: string; tipo_cambio: ChangeType; campo_modificado: string | null; created_at: string; usuario: { nombre: string; apellido: string } | null; ticket: { numero_ticket: string } | null }
    return { id: row.id, tipo: row.tipo_cambio, descripcion: row.campo_modificado ? `Campo "${row.campo_modificado}" actualizado` : "Ticket actualizado", usuario: row.usuario ? `${row.usuario.nombre} ${row.usuario.apellido}` : "Sistema", fecha: row.created_at, ticket_numero: row.ticket?.numero_ticket ?? null }
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
