"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  PaymentScheduleReport,
  TechnicianPayment,
  TechnicianPaymentSchedule,
} from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { PaymentProcessInput } from "@/lib/validations"
import { getCurrentUser } from "./auth"
import { isLocalMode } from "@/lib/local-mode"
import { processPaymentDemo } from "@/lib/mock-data"

// ─────────────────────────────────────────────────────────────────────────────
// PROCESAR PAGO (Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function processPaymentAction(
  paymentId: string,
  input: PaymentProcessInput
): Promise<ActionResponse<TechnicianPayment>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos para procesar pagos" }

  if (isLocalMode()) {
    const result = processPaymentDemo(paymentId, input, currentUser)
    if (!result) return { success: false, error: "Pago no encontrado" }
    revalidatePath("/dashboard/pagos")
    return { success: true, data: result, message: "Pago procesado exitosamente" }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("pagos_tecnicos")
    .update({
      estado_pago: "pagado",
      fecha_pago: new Date().toISOString(),
      metodo_pago: input.metodo_pago,
      referencia_pago: input.referencia_pago || null,
      pagado_por: currentUser.id,
      observaciones: input.observaciones || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("estado_pago", "pendiente")
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  if (!data) return { success: false, error: "Pago no encontrado o ya procesado" }

  revalidatePath("/dashboard/pagos")
  return { success: true, data: data as TechnicianPayment, message: "Pago procesado exitosamente" }
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERAR CUADRO DE PAGOS (Gerente+)
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePaymentSchedule(params: {
  desde?: string
  hasta?: string
  tecnicoId?: string
  soloFinalizados?: boolean
}): Promise<ActionResponse<PaymentScheduleReport>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos" }

  const hasta = params.hasta ? new Date(params.hasta) : new Date()
  const desdeDate = params.desde
    ? new Date(params.desde)
    : new Date(hasta.getFullYear(), hasta.getMonth(), 1)

  if (isLocalMode()) {
    // Import inline to avoid circular deps
    const { getDemoTickets, getDemoPayments } = await import("@/lib/mock-data")
    const allTickets = getDemoTickets()
    const allPayments = getDemoPayments()

    // Filter finalized tickets in period
    const tickets = allTickets.filter((t) => {
      if (params.soloFinalizados !== false && t.estado !== "finalizado") return false
      if (!t.fecha_finalizacion) return false
      const d = new Date(t.fecha_finalizacion)
      if (d < desdeDate || d > hasta) return false
      if (params.tecnicoId && t.tecnico_id !== params.tecnicoId) return false
      return true
    })

    // Group by tecnico
    const tecnicoMap = new Map<string, TechnicianPaymentSchedule>()

    for (const ticket of tickets) {
      if (!ticket.tecnico_id) continue
      const payment = allPayments.find((p) => p.ticket_id === ticket.id)
      const tecnico = ticket.tecnico
      if (!tecnico) continue

      const key = ticket.tecnico_id
      if (!tecnicoMap.has(key)) {
        tecnicoMap.set(key, {
          tecnico_id: key,
          tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`,
          rows: [],
          subtotal_servicio: 0,
          subtotal_comision: 0,
          pagados: 0,
          pendientes: 0,
        })
      }
      const schedule = tecnicoMap.get(key)!
      const porcentaje = payment?.porcentaje_comision ?? 50
      const montoAPagar = payment?.monto_a_pagar ?? (ticket.monto_servicio * porcentaje) / 100

      schedule.rows.push({
        fecha_finalizacion: ticket.fecha_finalizacion!,
        ticket_numero: ticket.numero_ticket,
        cliente_nombre: ticket.cliente_nombre,
        cliente_empresa: ticket.cliente_empresa,
        descripcion: ticket.asunto,
        monto_servicio: ticket.monto_servicio,
        porcentaje_comision: porcentaje,
        monto_a_pagar: montoAPagar,
        estado_pago: payment?.estado_pago ?? "pendiente",
        metodo_pago: payment?.metodo_pago ?? null,
        referencia_pago: payment?.referencia_pago ?? null,
      })

      schedule.subtotal_servicio += ticket.monto_servicio
      schedule.subtotal_comision += montoAPagar
      if (payment?.estado_pago === "pagado") schedule.pagados += montoAPagar
      else schedule.pendientes += montoAPagar
    }

    const tecnicos = Array.from(tecnicoMap.values())
    const total_servicio = tecnicos.reduce((s, t) => s + t.subtotal_servicio, 0)
    const total_comision = tecnicos.reduce((s, t) => s + t.subtotal_comision, 0)
    const total_pagado = tecnicos.reduce((s, t) => s + t.pagados, 0)
    const total_pendiente = tecnicos.reduce((s, t) => s + t.pendientes, 0)

    return {
      success: true,
      data: {
        periodo_desde: desdeDate.toISOString(),
        periodo_hasta: hasta.toISOString(),
        generado_en: new Date().toISOString(),
        generado_por: `${currentUser.nombre} ${currentUser.apellido}`,
        tecnicos,
        total_servicio,
        total_comision,
        total_pagado,
        total_pendiente,
      },
    }
  }

  // Supabase mode
  const supabase = await createClient()
  const { data: payments, error } = await supabase
    .from("pagos_tecnicos")
    .select("*, ticket:tickets(*), tecnico:users!tecnico_id(*)")
    .gte("tickets.fecha_finalizacion", desdeDate.toISOString())
    .lte("tickets.fecha_finalizacion", hasta.toISOString())

  if (error) return { success: false, error: error.message }

  // Same grouping logic
  const tecnicoMap = new Map<string, TechnicianPaymentSchedule>()
  for (const payment of payments ?? []) {
    const ticket = payment.ticket
    const tecnico = payment.tecnico
    if (!ticket || !tecnico) continue
    if (params.tecnicoId && tecnico.id !== params.tecnicoId) continue

    const key = tecnico.id
    if (!tecnicoMap.has(key)) {
      tecnicoMap.set(key, {
        tecnico_id: key,
        tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`,
        rows: [],
        subtotal_servicio: 0,
        subtotal_comision: 0,
        pagados: 0,
        pendientes: 0,
      })
    }
    const schedule = tecnicoMap.get(key)!
    schedule.rows.push({
      fecha_finalizacion: ticket.fecha_finalizacion,
      ticket_numero: ticket.numero_ticket,
      cliente_nombre: ticket.cliente_nombre,
      cliente_empresa: ticket.cliente_empresa,
      descripcion: ticket.asunto,
      monto_servicio: ticket.monto_servicio,
      porcentaje_comision: payment.porcentaje_comision,
      monto_a_pagar: payment.monto_a_pagar,
      estado_pago: payment.estado_pago,
      metodo_pago: payment.metodo_pago,
      referencia_pago: payment.referencia_pago,
    })
    schedule.subtotal_servicio += ticket.monto_servicio
    schedule.subtotal_comision += payment.monto_a_pagar
    if (payment.estado_pago === "pagado") schedule.pagados += payment.monto_a_pagar
    else schedule.pendientes += payment.monto_a_pagar
  }

  const tecnicos = Array.from(tecnicoMap.values())
  return {
    success: true,
    data: {
      periodo_desde: desdeDate.toISOString(),
      periodo_hasta: hasta.toISOString(),
      generado_en: new Date().toISOString(),
      generado_por: `${currentUser.nombre} ${currentUser.apellido}`,
      tecnicos,
      total_servicio: tecnicos.reduce((s, t) => s + t.subtotal_servicio, 0),
      total_comision: tecnicos.reduce((s, t) => s + t.subtotal_comision, 0),
      total_pagado: tecnicos.reduce((s, t) => s + t.pagados, 0),
      total_pendiente: tecnicos.reduce((s, t) => s + t.pendientes, 0),
    },
  }
}
