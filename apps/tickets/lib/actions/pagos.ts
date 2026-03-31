"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  PaymentMethod,
  PaymentStatus,
  PaymentScheduleReport,
  TechnicianPayment,
  TechnicianPaymentSchedule,
} from "@/types"
import { ROLE_HIERARCHY } from "@/types"
import type { PaymentProcessInput } from "@/lib/validations"
import { getCurrentUser } from "./auth"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import { processPaymentDemo } from "@/lib/mock-data"
import { getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"

export interface PaymentDashboardItem {
  id: string
  monto_a_pagar: number
  estado_pago: PaymentStatus
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: PaymentMethod | null
  referencia_pago: string | null
  ticket: { numero_ticket: string; asunto: string }
  tecnico: { id: string; nombre: string; apellido: string }
}

export async function getPaymentsDashboardData(): Promise<ActionResponse<PaymentDashboardItem[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const { getDemoPaymentsView } = await import("@/lib/mock-data")
    const demoPayments = getDemoPaymentsView()
    return {
      success: true,
      data: [...demoPayments.pending, ...demoPayments.completed] as PaymentDashboardItem[],
    }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const [pagosSnap, ticketsSnap, usersSnap] = await Promise.all([
        db.collection("pagos").orderBy("fecha_habilitacion", "desc").get(),
        db.collection("tickets").get(),
        db.collection("users").get(),
      ])

      const ticketsMap = new Map<string, Record<string, unknown>>()
      const usersMap = new Map<string, Record<string, unknown>>()

      ticketsSnap.docs.forEach((doc) => ticketsMap.set(doc.id, { id: doc.id, ...doc.data() }))
      usersSnap.docs.forEach((doc) => usersMap.set(doc.id, { id: doc.id, ...doc.data() }))

      const data = pagosSnap.docs.flatMap((doc) => {
        const pago = fromFirestoreDoc<TechnicianPayment>(doc.id, doc.data())
        const ticket = ticketsMap.get(pago.ticket_id)
        const tecnico = usersMap.get(pago.tecnico_id)

        if (!ticket || !tecnico) return []

        return [{
          id: pago.id,
          monto_a_pagar: pago.monto_a_pagar,
          estado_pago: pago.estado_pago,
          fecha_habilitacion: pago.fecha_habilitacion,
          fecha_pago: pago.fecha_pago,
          metodo_pago: pago.metodo_pago,
          referencia_pago: pago.referencia_pago,
          ticket: {
            numero_ticket: String(ticket.numero_ticket ?? ""),
            asunto: String(ticket.asunto ?? ""),
          },
          tecnico: {
            id: String(tecnico.id ?? pago.tecnico_id),
            nombre: String(tecnico.nombre ?? ""),
            apellido: String(tecnico.apellido ?? ""),
          },
        }] satisfies PaymentDashboardItem[]
      })

      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Pagos requiere configuración Firebase válida" }
}

export async function getPaymentTechnicians(): Promise<ActionResponse<Array<{ id: string; nombre: string; apellido: string }>>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 3) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) {
    const { getDemoUsers } = await import("@/lib/mock-data")
    return {
      success: true,
      data: getDemoUsers()
        .filter((user) => user.rol === "tecnico" && user.estado === "activo")
        .map((user) => ({ id: user.id, nombre: user.nombre, apellido: user.apellido })),
    }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const usersSnap = await db.collection("users").where("rol", "==", "tecnico").where("estado", "==", "activo").get()
      return {
        success: true,
        data: usersSnap.docs
          .map((doc) => fromFirestoreDoc<{ id: string; nombre: string; apellido: string }>(doc.id, doc.data()))
          .sort((a, b) => a.nombre.localeCompare(b.nombre)),
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Pagos requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESAR PAGO
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

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("pagos").doc(paymentId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Pago no encontrado" }
      const pago = snap.data()!
      if (pago.estado_pago !== "pendiente") return { success: false, error: "Pago no encontrado o ya procesado" }
      const now = new Date().toISOString()
      const updateData = cleanForFirestore({
        estado_pago: "pagado",
        fecha_pago: now,
        metodo_pago: input.metodo_pago,
        referencia_pago: input.referencia_pago || null,
        pagado_por: currentUser.id,
        observaciones: input.observaciones || null,
        updated_at: now,
      })
      await ref.update(updateData)
      revalidatePath("/dashboard/pagos")
      return {
        success: true,
        data: fromFirestoreDoc<TechnicianPayment>(paymentId, { ...pago, ...updateData }),
        message: "Pago procesado exitosamente",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
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
// GENERAR CUADRO DE PAGOS
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
    const { getDemoTickets, getDemoPayments } = await import("@/lib/mock-data")
    const allTickets = getDemoTickets()
    const allPayments = getDemoPayments()

    const tickets = allTickets.filter((t) => {
      if (params.soloFinalizados !== false && t.estado !== "finalizado") return false
      if (!t.fecha_finalizacion) return false
      const d = new Date(t.fecha_finalizacion)
      if (d < desdeDate || d > hasta) return false
      if (params.tecnicoId && t.tecnico_id !== params.tecnicoId) return false
      return true
    })

    const tecnicoMap = new Map<string, TechnicianPaymentSchedule>()
    for (const ticket of tickets) {
      if (!ticket.tecnico_id) continue
      const payment = allPayments.find((p) => p.ticket_id === ticket.id)
      const tecnico = ticket.tecnico
      if (!tecnico) continue
      const key = ticket.tecnico_id
      if (!tecnicoMap.has(key)) {
        tecnicoMap.set(key, { tecnico_id: key, tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`, rows: [], subtotal_servicio: 0, subtotal_comision: 0, pagados: 0, pendientes: 0 })
      }
      const schedule = tecnicoMap.get(key)!
      const porcentaje = payment?.porcentaje_comision ?? 50
      const montoAPagar = payment?.monto_a_pagar ?? (ticket.monto_servicio * porcentaje) / 100
      schedule.rows.push({ fecha_finalizacion: ticket.fecha_finalizacion!, ticket_numero: ticket.numero_ticket, cliente_nombre: ticket.cliente_nombre, cliente_empresa: ticket.cliente_empresa, descripcion: ticket.asunto, monto_servicio: ticket.monto_servicio, porcentaje_comision: porcentaje, monto_a_pagar: montoAPagar, estado_pago: payment?.estado_pago ?? "pendiente", metodo_pago: payment?.metodo_pago ?? null, referencia_pago: payment?.referencia_pago ?? null })
      schedule.subtotal_servicio += ticket.monto_servicio
      schedule.subtotal_comision += montoAPagar
      if (payment?.estado_pago === "pagado") schedule.pagados += montoAPagar
      else schedule.pendientes += montoAPagar
    }
    const tecnicos = Array.from(tecnicoMap.values())
    return {
      success: true,
      data: {
        periodo_desde: desdeDate.toISOString(), periodo_hasta: hasta.toISOString(),
        generado_en: new Date().toISOString(), generado_por: `${currentUser.nombre} ${currentUser.apellido}`,
        tecnicos,
        total_servicio: tecnicos.reduce((s, t) => s + t.subtotal_servicio, 0),
        total_comision: tecnicos.reduce((s, t) => s + t.subtotal_comision, 0),
        total_pagado: tecnicos.reduce((s, t) => s + t.pagados, 0),
        total_pendiente: tecnicos.reduce((s, t) => s + t.pendientes, 0),
      },
    }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const pagosSnap = await db.collection("pagos").get()
      const ticketsSnap = await db.collection("tickets").get()
      const usersSnap = await db.collection("users").get()
      const ticketsMap = new Map<string, Record<string, unknown>>()
      ticketsSnap.docs.forEach((d) => ticketsMap.set(d.id, { id: d.id, ...d.data() }))
      const usersMap = new Map<string, Record<string, unknown>>()
      usersSnap.docs.forEach((d) => usersMap.set(d.id, { id: d.id, ...d.data() }))
      const tecnicoMap = new Map<string, TechnicianPaymentSchedule>()

      for (const d of pagosSnap.docs) {
        const pago = d.data()
        const ticket = ticketsMap.get(pago.ticket_id as string)
        if (!ticket) continue
        if (params.soloFinalizados !== false && ticket.estado !== "finalizado") continue
        if (!ticket.fecha_finalizacion) continue
        const finDate = new Date(ticket.fecha_finalizacion as string)
        if (finDate < desdeDate || finDate > hasta) continue
        if (params.tecnicoId && ticket.tecnico_id !== params.tecnicoId) continue
        const tecnicoId = pago.tecnico_id as string
        const tecnico = usersMap.get(tecnicoId)
        if (!tecnico) continue
        const key = tecnicoId
        if (!tecnicoMap.has(key)) {
          tecnicoMap.set(key, { tecnico_id: key, tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`, rows: [], subtotal_servicio: 0, subtotal_comision: 0, pagados: 0, pendientes: 0 })
        }
        const schedule = tecnicoMap.get(key)!
        const monto = (pago.monto_a_pagar as number) || 0
        schedule.rows.push({
          fecha_finalizacion: ticket.fecha_finalizacion as string,
          ticket_numero: ticket.numero_ticket as string,
          cliente_nombre: ticket.cliente_nombre as string,
          cliente_empresa: (ticket.cliente_empresa as string | null) ?? null,
          descripcion: ticket.asunto as string,
          monto_servicio: (ticket.monto_servicio as number) || 0,
          porcentaje_comision: (pago.porcentaje_comision as number) || 50,
          monto_a_pagar: monto,
          estado_pago: pago.estado_pago as PaymentStatus,
          metodo_pago: (pago.metodo_pago as PaymentMethod | null) ?? null,
          referencia_pago: (pago.referencia_pago as string | null) ?? null,
        })
        schedule.subtotal_servicio += (ticket.monto_servicio as number) || 0
        schedule.subtotal_comision += monto
        if (pago.estado_pago === "pagado") schedule.pagados += monto
        else schedule.pendientes += monto
      }

      const tecnicos = Array.from(tecnicoMap.values())
      return {
        success: true,
        data: {
          periodo_desde: desdeDate.toISOString(), periodo_hasta: hasta.toISOString(),
          generado_en: new Date().toISOString(), generado_por: `${currentUser.nombre} ${currentUser.apellido}`,
          tecnicos,
          total_servicio: tecnicos.reduce((s, t) => s + t.subtotal_servicio, 0),
          total_comision: tecnicos.reduce((s, t) => s + t.subtotal_comision, 0),
          total_pagado: tecnicos.reduce((s, t) => s + t.pagados, 0),
          total_pendiente: tecnicos.reduce((s, t) => s + t.pendientes, 0),
        },
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  // Supabase
  const supabase = await createClient()
  const { data: payments, error } = await supabase
    .from("pagos_tecnicos")
    .select("*, ticket:tickets(*), tecnico:users!tecnico_id(*)")
    .gte("tickets.fecha_finalizacion", desdeDate.toISOString())
    .lte("tickets.fecha_finalizacion", hasta.toISOString())

  if (error) return { success: false, error: error.message }

  const tecnicoMap2 = new Map<string, TechnicianPaymentSchedule>()
  for (const payment of payments ?? []) {
    const ticket = payment.ticket
    const tecnico = payment.tecnico
    if (!ticket || !tecnico) continue
    if (params.tecnicoId && tecnico.id !== params.tecnicoId) continue
    const key = tecnico.id
    if (!tecnicoMap2.has(key)) {
      tecnicoMap2.set(key, { tecnico_id: key, tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`, rows: [], subtotal_servicio: 0, subtotal_comision: 0, pagados: 0, pendientes: 0 })
    }
    const schedule = tecnicoMap2.get(key)!
    schedule.rows.push({ fecha_finalizacion: ticket.fecha_finalizacion, ticket_numero: ticket.numero_ticket, cliente_nombre: ticket.cliente_nombre, cliente_empresa: ticket.cliente_empresa, descripcion: ticket.asunto, monto_servicio: ticket.monto_servicio, porcentaje_comision: payment.porcentaje_comision, monto_a_pagar: payment.monto_a_pagar, estado_pago: payment.estado_pago, metodo_pago: payment.metodo_pago, referencia_pago: payment.referencia_pago })
    schedule.subtotal_servicio += ticket.monto_servicio
    schedule.subtotal_comision += payment.monto_a_pagar
    if (payment.estado_pago === "pagado") schedule.pagados += payment.monto_a_pagar
    else schedule.pendientes += payment.monto_a_pagar
  }
  const tecnicos2 = Array.from(tecnicoMap2.values())
  return {
    success: true,
    data: {
      periodo_desde: desdeDate.toISOString(), periodo_hasta: hasta.toISOString(),
      generado_en: new Date().toISOString(), generado_por: `${currentUser.nombre} ${currentUser.apellido}`,
      tecnicos: tecnicos2,
      total_servicio: tecnicos2.reduce((s, t) => s + t.subtotal_servicio, 0),
      total_comision: tecnicos2.reduce((s, t) => s + t.subtotal_comision, 0),
      total_pagado: tecnicos2.reduce((s, t) => s + t.pagados, 0),
      total_pendiente: tecnicos2.reduce((s, t) => s + t.pendientes, 0),
    },
  }
}
