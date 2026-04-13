"use server"

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

  return { success: false, error: "Dashboard requiere configuración Firebase válida" }
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

  return { success: false, error: "Estadísticas requieren configuración Firebase válida" }
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

  return { success: false, error: "Tickets recientes requieren configuración Firebase válida" }
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

  return { success: false, error: "Dashboard extendido requiere configuración Firebase válida" }
}
