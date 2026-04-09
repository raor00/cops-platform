"use server"

import { getCurrentUser } from "./auth"
import { getTickets } from "./tickets"
import { ROLE_HIERARCHY } from "@/types"
import type { ActionResponse, ClientReportRow, DetailedTicketReportRow, ReportsSummary, TechnicianReportRow, Ticket } from "@/types"

function getWorkedHours(ticket: Ticket) {
  return Number(((ticket.tiempo_trabajado || 0) / 60).toFixed(2))
}

function getTotalMinutes(ticket: Ticket) {
  if (!ticket.fecha_inicio || !ticket.fecha_finalizacion) return 0
  return Math.max(0, Math.round((new Date(ticket.fecha_finalizacion).getTime() - new Date(ticket.fecha_inicio).getTime()) / 60000))
}

function matchMonth(ticket: Ticket, month: string) {
  if (!month) return true
  const target = ticket.fecha_servicio || ticket.created_at
  return target.startsWith(month)
}

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase()
}

function buildRows(tickets: Ticket[]): ClientReportRow[] {
  const grouped = new Map<string, ClientReportRow>()

  for (const ticket of tickets) {
    const cliente = ticket.cliente_empresa || ticket.cliente_nombre || "Sin cliente"
    const agencia = ticket.agencia_bancaribe || "Sin agencia"
    const key = `${cliente}::${agencia}`
    const current = grouped.get(key) || {
      cliente,
      agencia,
      tickets: 0,
      servicios: 0,
      proyectos: 0,
      finalizados: 0,
      cupones: 0,
      horasTrabajadas: 0,
    }

    current.tickets += 1
    current.servicios += ticket.tipo === "servicio" ? 1 : 0
    current.proyectos += ticket.tipo === "proyecto" ? 1 : 0
    current.finalizados += ticket.estado === "finalizado" ? 1 : 0
    current.cupones += ticket.cupones_bancaribe || 0
    current.horasTrabajadas += getWorkedHours(ticket)
    grouped.set(key, current)
  }

  return Array.from(grouped.values()).sort((a, b) => a.cliente.localeCompare(b.cliente) || a.agencia.localeCompare(b.agencia))
}

function buildTechnicianRows(tickets: Ticket[]): TechnicianReportRow[] {
  const grouped = new Map<string, TechnicianReportRow>()

  for (const ticket of tickets) {
    const tecnico = ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido}`.trim() : "Sin técnico"
    const current = grouped.get(tecnico) || {
      tecnico,
      tickets: 0,
      servicios: 0,
      proyectos: 0,
      finalizados: 0,
      cupones: 0,
      horasTrabajadas: 0,
    }

    current.tickets += 1
    current.servicios += ticket.tipo === "servicio" ? 1 : 0
    current.proyectos += ticket.tipo === "proyecto" ? 1 : 0
    current.finalizados += ticket.estado === "finalizado" ? 1 : 0
    current.cupones += ticket.cupones_bancaribe || 0
    current.horasTrabajadas += getWorkedHours(ticket)
    grouped.set(tecnico, current)
  }

  return Array.from(grouped.values()).sort((a, b) => a.tecnico.localeCompare(b.tecnico))
}

function buildDetailedRows(tickets: Ticket[]): DetailedTicketReportRow[] {
  return tickets.map((ticket) => ({
    numero_ticket: ticket.numero_ticket,
    asunto: ticket.asunto,
    cliente: ticket.cliente_empresa || ticket.cliente_nombre || "Sin cliente",
    agencia: ticket.agencia_bancaribe || "Sin agencia",
    tecnico: ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido}`.trim() : "Sin técnico",
    tipo: ticket.tipo,
    estado: ticket.estado,
    prioridad: ticket.prioridad,
    fecha_creacion: ticket.created_at || "",
    fecha_servicio: ticket.fecha_servicio || "",
    fecha_llegada: ticket.fecha_llegada || "",
    fecha_inicio: ticket.fecha_inicio || "",
    fecha_finalizacion: ticket.fecha_finalizacion || "",
    cupones: ticket.cupones_bancaribe || 0,
    horas_trabajadas: getWorkedHours(ticket),
    tiempo_total_minutos: getTotalMinutes(ticket),
  }))
}

function applyPreset(filters: { month?: string; client?: string; agency?: string; technician?: string; preset?: string }) {
  const preset = filters.preset || ""
  if (preset === "bancaribe") return { ...filters, client: filters.client || "Bancaribe" }
  return filters
}

export async function getReportsSummary(filters: {
  month?: string
  client?: string
  agency?: string
  technician?: string
  preset?: string
}): Promise<ActionResponse<ReportsSummary>> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[user.rol] < 2) return { success: false, error: "Sin permisos" }

  const ticketsResult = await getTickets({ pageSize: 500 })
  if (!ticketsResult.success || !ticketsResult.data) {
    return { success: false, error: ticketsResult.error || "No se pudieron cargar los tickets" }
  }

  const applied = applyPreset(filters)
  const month = applied.month || ""
  const client = normalizeText(applied.client)
  const agency = normalizeText(applied.agency)
  const technician = normalizeText(applied.technician)

  const allTickets = ticketsResult.data.data.filter((ticket) =>
    matchMonth(ticket, month) &&
    (!client || normalizeText(ticket.cliente_empresa || ticket.cliente_nombre).includes(client)) &&
    (!agency || normalizeText(ticket.agencia_bancaribe).includes(agency)) &&
    (!technician || normalizeText(ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido}` : "").includes(technician))
  )

  const bancaribeTickets = allTickets.filter((ticket) => normalizeText(ticket.cliente_empresa).includes("bancaribe"))

  const summary: ReportsSummary = {
    filters: { month, client: applied.client || "", agency: applied.agency || "", technician: applied.technician || "", preset: applied.preset || "" },
    totalTickets: allTickets.length,
    totalFinalizados: allTickets.filter((ticket) => ticket.estado === "finalizado").length,
    totalCupones: allTickets.reduce((sum, ticket) => sum + (ticket.cupones_bancaribe || 0), 0),
    totalHoras: Number(allTickets.reduce((sum, ticket) => sum + getWorkedHours(ticket), 0).toFixed(2)),
    totalAgencias: new Set(allTickets.map((ticket) => ticket.agencia_bancaribe).filter(Boolean)).size,
    bancaribeRows: buildRows(bancaribeTickets),
    clientRows: buildRows(allTickets),
    technicianRows: buildTechnicianRows(allTickets),
    ticketRows: buildDetailedRows(allTickets),
  }

  return { success: true, data: summary }
}
