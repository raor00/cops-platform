"use server"
import { revalidatePath } from "next/cache"
import type {
  ActionResponse,
  ChangeHistory,
  MaterialItem,
  Ticket,
  TicketFoto,
  TicketDocumento,
  TicketCreateInput,
  TicketUpdateInput,
  TicketStatus,
  PaginatedResponse,
  DashboardStats,
  UpdateLog,
} from "@/types"
import {
  hasPermission,
  ROLE_HIERARCHY,
  VALID_TRANSITIONS,
  ADMIN_REVERSE_TRANSITIONS,
  generateTicketNumber,
  DEFAULT_SERVICE_AMOUNT,
  DEFAULT_INSPECTION_AMOUNT,
  DEFAULT_COMMISSION_PERCENTAGE,
} from "@/types"
import { getCurrentUser } from "./auth"
import { descontarStockMaterialesTicket, reintegrarStockMaterialesTicket } from "./catalogo"
import { isLocalMode, isFirebaseMode } from "@/lib/local-mode"
import {
  enforceCreateBillingRules,
  enforceUpdateBillingRules,
  prependAgencyToDescription,
  shouldAllowWorkedTime,
} from "@/lib/tickets-business-rules"
import {
  assignDemoTechnician,
  changeDemoTicketStatus as changeDemoTicketStatusMock,
  createDemoTicket,
  createDemoCliente,
  createDemoConvertirInspeccion,
  deleteDemoTicket,
  getDemoDashboardStats,
  getDemoClientes,
  getDemoTechnicians,
  getDemoTicketById,
  getDemoTicketsPage,
  updateDemoTicket,
  updateDemoCliente,
  getDemoUpdateLogs,
  addDemoUpdateLog,
  updateDemoUpdateLog,
  deleteDemoUpdateLog,
  markDemoTicketArrival,
  pauseDemoTicketUntilTomorrow,
  resumeDemoTicketWork,
  getDemoSesionesByTicket,
  finalizarDemoSesion,
} from "@/lib/mock-data"
import { getAdminFirestore, fromFirestoreDoc, cleanForFirestore } from "@/lib/firebase/admin"
import { deleteFileFromStorage } from "@/lib/firebase/storage-rest"

function normalizeClientValue(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase()
}

function splitClientName(fullName: string): { nombre: string; apellido?: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return { nombre: fullName.trim() }
  return {
    nombre: parts[0]!,
    apellido: parts.slice(1).join(" "),
  }
}

async function ensureClientRecordFromTicketInput(input: TicketCreateInput): Promise<void> {
  const clienteNombre = input.cliente_nombre.trim()
  const clienteTelefono = input.cliente_telefono.trim()
  const clienteDireccion = input.cliente_direccion.trim()
  if (!clienteNombre || !clienteTelefono || !clienteDireccion) return

  const { nombre, apellido } = splitClientName(clienteNombre)
  const empresa = input.cliente_empresa?.trim() || undefined
  const email = input.cliente_email?.trim() || undefined

  if (isLocalMode()) {
    const existing = getDemoClientes({ page: 1, pageSize: 500 }).data.find((cliente) => {
      const samePhone = normalizeClientValue(cliente.telefono) === normalizeClientValue(clienteTelefono)
      const sameName = normalizeClientValue(`${cliente.nombre} ${cliente.apellido ?? ""}`) === normalizeClientValue(clienteNombre)
      const sameCompany = normalizeClientValue(cliente.empresa) === normalizeClientValue(empresa)
      return samePhone || (sameName && sameCompany)
    })

    if (!existing) {
      createDemoCliente({
        nombre,
        apellido,
        empresa,
        email,
        telefono: clienteTelefono,
        direccion: clienteDireccion,
      })
      return
    }

    updateDemoCliente(existing.id, {
      nombre,
      apellido,
      empresa,
      email,
      telefono: clienteTelefono,
      direccion: clienteDireccion,
      estado: "activo",
    })
    return
  }

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const allClientes = await db.collection("clientes").get()
    const existing = allClientes.docs.find((doc) => {
      const cliente = doc.data()
      const samePhone = normalizeClientValue(cliente.telefono) === normalizeClientValue(clienteTelefono)
      const sameName = normalizeClientValue(`${cliente.nombre ?? ""} ${cliente.apellido ?? ""}`) === normalizeClientValue(clienteNombre)
      const sameCompany = normalizeClientValue(cliente.empresa) === normalizeClientValue(empresa)
      return samePhone || (sameName && sameCompany)
    })

    const now = new Date().toISOString()
    const payload = cleanForFirestore({
      nombre,
      apellido: apellido || null,
      empresa: empresa || null,
      email: email || null,
      telefono: clienteTelefono,
      direccion: clienteDireccion,
      estado: "activo",
      updated_at: now,
    })

    if (!existing) {
      const ref = db.collection("clientes").doc()
      await ref.set({ ...payload, created_at: now, observaciones: null, rif_cedula: null, contactos: [] })
      return
    }

    await db.collection("clientes").doc(existing.id).set(payload, { merge: true })
  }
}

// ─── Firebase helpers ─────────────────────────────────────────────────────────

async function fbGetAllTickets(): Promise<Ticket[]> {
  const db = getAdminFirestore()
  const snap = await db.collection("tickets").orderBy("created_at", "desc").get()
  return snap.docs.map((d) => fromFirestoreDoc<Ticket>(d.id, d.data()))
}

async function fbGetTicketById(id: string): Promise<Ticket | null> {
  const db = getAdminFirestore()
  const doc = await db.collection("tickets").doc(id).get()
  if (!doc.exists) return null
  return fromFirestoreDoc<Ticket>(doc.id, doc.data()!)
}

async function fbGetUserMini(id: string): Promise<{ id: string; nombre: string; apellido: string; email?: string; rol?: string; telefono?: string } | null> {
  const db = getAdminFirestore()
  const doc = await db.collection("users").doc(id).get()
  if (!doc.exists) return null
  const d = doc.data()!
  return { id: doc.id, nombre: d.nombre, apellido: d.apellido, email: d.email, rol: d.rol, telefono: d.telefono }
}

async function fbHydrateUpdateLogs(logs: UpdateLog[]): Promise<UpdateLog[]> {
  const db = getAdminFirestore()
  const uniqueAuthorIds = [...new Set(logs.map((log) => log.autor_id).filter(Boolean))]
  const authorMap = new Map<string, UpdateLog["autor"]>()

  await Promise.all(
    uniqueAuthorIds.map(async (authorId) => {
      try {
        const doc = await db.collection("users").doc(authorId).get()
        if (!doc.exists) return
        const data = doc.data() || {}
        authorMap.set(authorId, {
          nombre: String(data.nombre || ""),
          apellido: String(data.apellido || ""),
          rol: String(data.rol || "tecnico") as UpdateLog["autor"] extends infer T ? T extends { rol: infer R } ? R : never : never,
          cargo: typeof data.cargo === "string" ? data.cargo : null,
        })
      } catch {
        // ignore hydration errors
      }
    })
  )

  return logs.map((log) => ({
    ...log,
    autor: authorMap.get(log.autor_id) || log.autor,
  }))
}

async function canAccessTicket(
  ticketId: string,
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
): Promise<boolean> {
  if (ROLE_HIERARCHY[user.rol] >= 2) return true

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, user)
    return ticket?.tecnico_id === user.id
  }

  if (isFirebaseMode()) {
    const ticket = await fbGetTicketById(ticketId)
    return ticket?.tecnico_id === user.id
  }

  return false
}

async function getTotalWorkedMinutes(ticketId: string): Promise<number> {
  if (isLocalMode()) {
    return getDemoSesionesByTicket(ticketId).reduce((sum, sesion) => sum + (sesion.duracion_minutos || 0), 0)
  }

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const snap = await db.collection("ticket_sesiones_trabajo").where("ticket_id", "==", ticketId).get()
    return snap.docs.reduce((sum, doc) => sum + Number(doc.data().duracion_minutos || 0), 0)
  }

  return 0
}

async function closeOpenWorkSession(ticketId: string, tecnicoId: string, notas?: string): Promise<void> {
  if (isLocalMode()) {
    const openSesion = getDemoSesionesByTicket(ticketId).find((sesion) => sesion.tecnico_id === tecnicoId && !sesion.fecha_fin)
    if (openSesion) finalizarDemoSesion(openSesion.id, notas)
    return
  }

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const snap = await db.collection("ticket_sesiones_trabajo")
      .where("ticket_id", "==", ticketId)
      .where("tecnico_id", "==", tecnicoId)
      .where("fecha_fin", "==", null)
      .limit(1)
      .get()

    if (snap.empty) return

    const doc = snap.docs[0]!
    const current = doc.data()
    const end = new Date()
    const start = new Date(String(current.fecha_inicio))
    const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
    await doc.ref.update(cleanForFirestore({ fecha_fin: end.toISOString(), duracion_minutos: duration, notas: notas || current.notas || null }))
    return
  }

  return
}

async function fbEnrichTicket(ticket: Ticket): Promise<Ticket> {
  const [creador, tecnico] = await Promise.all([
    ticket.creado_por ? fbGetUserMini(ticket.creado_por) : null,
    ticket.tecnico_id ? fbGetUserMini(ticket.tecnico_id) : null,
  ])
  return { ...ticket, creador: creador ?? undefined, tecnico: tecnico ?? undefined } as Ticket
}

function fbFilterTickets(
  tickets: Ticket[],
  currentUser: { id: string; rol: string },
  options?: { status?: TicketStatus; priority?: string; tecnicoId?: string; createdById?: string; search?: string }
): Ticket[] {
  let result = tickets

  if (currentUser.rol === "tecnico") {
    result = result.filter((t) => t.tecnico_id === currentUser.id)
  }
  if (options?.status) {
    result = result.filter((t) => t.estado === options.status)
  }
  if (options?.priority) {
    result = result.filter((t) => t.prioridad === options.priority)
  }
  if (options?.tecnicoId) {
    result = result.filter((t) => t.tecnico_id === options.tecnicoId)
  }
  if (options?.createdById) {
    result = result.filter((t) => t.creado_por === options.createdById)
  }
  if (options?.search) {
    const q = options.search.toLowerCase()
    result = result.filter(
      (t) =>
        t.numero_ticket?.toLowerCase().includes(q) ||
        t.cliente_nombre?.toLowerCase().includes(q) ||
        t.asunto?.toLowerCase().includes(q)
    )
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER TICKETS
// ─────────────────────────────────────────────────────────────────────────────

export async function getTickets(options?: {
  page?: number
  pageSize?: number
  status?: TicketStatus
  priority?: string
  tecnicoId?: string
  createdById?: string
  search?: string
}): Promise<ActionResponse<PaginatedResponse<Ticket>>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    return { success: true, data: getDemoTicketsPage(options, currentUser) }
  }

  if (isFirebaseMode()) {
    try {
      const all = await fbGetAllTickets()
      const filtered = fbFilterTickets(all, currentUser, options)
      const page = options?.page || 1
      const pageSize = options?.pageSize || 10
      const start = (page - 1) * pageSize
      const paged = filtered.slice(start, start + pageSize)

      return {
        success: true,
        data: {
          data: paged,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize),
        },
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function getTicketById(id: string): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(id, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    return { success: true, data: ticket }
  }

  if (isFirebaseMode()) {
    try {
      const ticket = await fbGetTicketById(id)
      if (!ticket) return { success: false, error: "Ticket no encontrado" }
      if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id)
        return { success: false, error: "No tienes permiso para ver este ticket" }
      return { success: true, data: await fbEnrichTicket(ticket) }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function createTicket(
  input: TicketCreateInput
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser, 'tickets:create'))
    return { success: false, error: "No tienes permisos para crear tickets" }

  const normalizedAgency = input.agencia_bancaribe?.trim() || undefined
  const normalizedInput: TicketCreateInput = {
    ...input,
    agencia_bancaribe: normalizedAgency,
    descripcion: prependAgencyToDescription(input.descripcion, normalizedAgency),
    ...enforceCreateBillingRules(input),
  }

  if (isLocalMode()) {
    const ticket = createDemoTicket(normalizedInput, currentUser)
    await ensureClientRecordFromTicketInput(input)
    revalidatePath("/dashboard/tickets")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/clientes")
    return { success: true, data: ticket, message: `Ticket ${ticket.numero_ticket} creado exitosamente` }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()

      // Get next sequence for this ticket type
      const existing = await fbGetAllTickets()
      const ofType = existing.filter((t) => t.tipo === input.tipo)
      let sequence = 1
      if (ofType.length > 0) {
        const nums = ofType
          .map((t) => {
            const m = t.numero_ticket?.match(/(\d{4})$/)
            return m ? parseInt(m[1]) : 0
          })
          .filter(Boolean)
        if (nums.length > 0) sequence = Math.max(...nums) + 1
      }

      const numeroTicket = generateTicketNumber(input.tipo, sequence)
      const now = new Date().toISOString()
      const newDoc = db.collection("tickets").doc()

      const ticketData = cleanForFirestore({
        numero_ticket: numeroTicket,
        tipo: input.tipo,
        cliente_nombre: input.cliente_nombre,
        cliente_empresa: input.cliente_empresa || null,
        cliente_email: input.cliente_email || null,
        cliente_telefono: input.cliente_telefono,
        cliente_direccion: input.cliente_direccion,
        asunto: input.asunto,
        descripcion: normalizedInput.descripcion,
        requerimientos: input.requerimientos || null,
        materiales_planificados: input.materiales_planificados || null,
        prioridad: input.prioridad,
        origen: input.origen,
        agencia_bancaribe: normalizedAgency || null,
        cupones_bancaribe: input.cupones_bancaribe ?? null,
        creado_por: currentUser.id,
        tecnico_id: input.tecnico_id || null,
        estado: input.estado === "borrador" ? "borrador" : "asignado",
        estado_operativo: input.estado === "borrador" ? null : "programado",
        fecha_asignacion: input.estado === "borrador" ? null : now,
        fecha_servicio: input.fecha_servicio || null,
        fecha_llegada: null,
        fecha_ultima_pausa: null,
        fecha_ultima_reanudacion: null,
        motivo_pausa: null,
        monto_servicio: normalizedInput.monto_servicio ?? DEFAULT_SERVICE_AMOUNT,
        facturacion_tipo: normalizedInput.facturacion_tipo ?? "fijo",
        tarifa_hora: normalizedInput.tarifa_hora ?? null,
        ticket_origen_id: null,
        ticket_derivado_id: null,
        created_at: now,
        updated_at: now,
      })

      await newDoc.set(ticketData)
      await ensureClientRecordFromTicketInput(input)

      const ticket: Ticket = { id: newDoc.id, ...ticketData } as Ticket

      revalidatePath("/dashboard/tickets")
      revalidatePath("/dashboard")
      revalidatePath("/dashboard/clientes")

      return { success: true, data: ticket, message: `Ticket ${numeroTicket} creado exitosamente` }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUALIZAR TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function updateTicket(
  id: string,
  input: TicketUpdateInput
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser, 'tickets:edit'))
    return { success: false, error: "No tienes permisos para modificar tickets" }

  if (isLocalMode()) {
    const existingTicket = getDemoTicketById(id, currentUser)
    if (!existingTicket) return { success: false, error: "Ticket no encontrado" }

    const effectiveAgency = input.agencia_bancaribe === undefined
      ? existingTicket.agencia_bancaribe
      : input.agencia_bancaribe

    const normalizedInput: TicketUpdateInput = {
      ...input,
      agencia_bancaribe: input.agencia_bancaribe?.trim(),
      ...(input.descripcion !== undefined || input.agencia_bancaribe !== undefined
        ? {
            descripcion: prependAgencyToDescription(
              input.descripcion ?? existingTicket.descripcion,
              effectiveAgency
            ),
          }
        : {}),
      ...enforceUpdateBillingRules(existingTicket, input),
    }

    const updatedTicket = updateDemoTicket(id, normalizedInput, currentUser)
    if (!updatedTicket) return { success: false, error: "Ticket no encontrado" }
    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${id}`)
    return { success: true, data: updatedTicket, message: "Ticket actualizado exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(id)
      const existing = await ref.get()
      if (!existing.exists) return { success: false, error: "Ticket no encontrado" }

      const currentTicket = fromFirestoreDoc<Ticket>(id, existing.data()!)
      const effectiveAgency = input.agencia_bancaribe === undefined
        ? currentTicket.agencia_bancaribe
        : input.agencia_bancaribe

      const normalizedInput: TicketUpdateInput = {
        ...input,
        agencia_bancaribe: input.agencia_bancaribe?.trim(),
        ...(input.descripcion !== undefined || input.agencia_bancaribe !== undefined
          ? {
              descripcion: prependAgencyToDescription(
                input.descripcion ?? currentTicket.descripcion,
                effectiveAgency
              ),
            }
          : {}),
        ...enforceUpdateBillingRules(currentTicket, input),
      }

      const updateData = cleanForFirestore({
        ...normalizedInput,
        modificado_por: currentUser.id,
        fecha_ultima_modificacion: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      await ref.update(updateData)
      const updated = fromFirestoreDoc<Ticket>(id, { ...existing.data()!, ...updateData })

      revalidatePath("/dashboard/tickets")
      revalidatePath(`/dashboard/tickets/${id}`)

      return { success: true, data: updated, message: "Ticket actualizado exitosamente" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMBIAR ESTADO
// ─────────────────────────────────────────────────────────────────────────────

export async function changeTicketStatus(
  id: string,
  newStatus: TicketStatus,
  additionalData?: {
    materiales_usados?: MaterialItem[]
    tiempo_trabajado?: number
    observaciones_tecnico?: string
    solucion_aplicada?: string
    motivo_pausa?: string
    fecha_servicio?: string
    monto_servicio_final?: number
  }
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const currentTicket = getDemoTicketById(id, currentUser)
    if (!currentTicket) return { success: false, error: "Ticket no encontrado" }
    if (currentUser.rol === "tecnico" && currentTicket.tecnico_id !== currentUser.id)
      return { success: false, error: "No tienes permiso para modificar este ticket" }
    if (currentUser.rol !== "tecnico" && !hasPermission(currentUser, 'tickets:change_status')) {
      return { success: false, error: "No tienes permisos para cambiar el estado de tickets" }
    }
    if (currentUser.rol === "tecnico" && newStatus === "finalizado") {
      return { success: false, error: "Los técnicos no pueden finalizar tickets. Deben dejar bitácora y notificar a coordinación." }
    }

    const allowsWorkedTime = shouldAllowWorkedTime(currentTicket)
    const sanitizedAdditional = {
      ...additionalData,
      ...(allowsWorkedTime ? {} : { tiempo_trabajado: undefined, monto_servicio_final: undefined }),
    }

    const result = changeDemoTicketStatusMock(id, newStatus, sanitizedAdditional, currentUser.rol)
    if (result.error || !result.ticket)
      return { success: false, error: result.error || "No se pudo actualizar el ticket" }

    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${id}`)
    revalidatePath("/dashboard/pagos")
    return { success: true, data: result.ticket, message: `Estado cambiado a ${newStatus}` }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(id)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Ticket no encontrado" }

      const ticket = fromFirestoreDoc<Ticket>(id, snap.data()!)
      const allowsWorkedTime = shouldAllowWorkedTime(ticket)
      const sanitizedAdditional = {
        ...additionalData,
        ...(allowsWorkedTime ? {} : { tiempo_trabajado: undefined, monto_servicio_final: undefined }),
      }

      if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id)
        return { success: false, error: "No tienes permiso para modificar este ticket" }
      if (currentUser.rol !== "tecnico" && !hasPermission(currentUser, 'tickets:change_status')) {
        return { success: false, error: "No tienes permisos para cambiar el estado de tickets" }
      }
      if (currentUser.rol === "tecnico" && newStatus === "finalizado") {
        return { success: false, error: "Los técnicos no pueden finalizar tickets. Deben dejar bitácora y notificar a coordinación." }
      }

      const isAdmin = hasPermission(currentUser, 'tickets:edit')
      const forwardOk = VALID_TRANSITIONS[ticket.estado as TicketStatus].includes(newStatus)
      const reverseOk = isAdmin && ADMIN_REVERSE_TRANSITIONS[ticket.estado as TicketStatus].includes(newStatus)

      if (!forwardOk && !reverseOk)
        return { success: false, error: `No se puede cambiar de ${ticket.estado} a ${newStatus}` }

      const now = new Date().toISOString()
      const updateData: Record<string, unknown> = { estado: newStatus, updated_at: now }
      const materialesUsados = sanitizedAdditional?.materiales_usados?.filter((material) => material.nombre.trim() && material.cantidad > 0) ?? []
      const isRevertingFromFinalizado = ticket.estado === "finalizado" && newStatus !== "finalizado"
      const materialesRegistrados = (ticket.materiales_usados ?? []).filter((material) => material.nombre.trim() && material.cantidad > 0)

      if (newStatus === "iniciado" && !ticket.fecha_inicio) updateData.fecha_inicio = now
      if (newStatus === "iniciado") updateData.estado_operativo = "trabajando"
      if (newStatus === "en_progreso") updateData.estado_operativo = "trabajando"
      if (newStatus === "cancelado") updateData.estado_operativo = "reprogramado"
      if (newStatus === "finalizado") {
        await closeOpenWorkSession(id, currentUser.id, sanitizedAdditional?.observaciones_tecnico)
        updateData.fecha_finalizacion = now
        updateData.estado_operativo = "finalizado"
        const computedMinutes = await getTotalWorkedMinutes(id)
        if (computedMinutes > 0 && sanitizedAdditional?.tiempo_trabajado === undefined && allowsWorkedTime) {
          updateData.tiempo_trabajado = computedMinutes
        }
      }

      if (sanitizedAdditional?.materiales_usados) updateData.materiales_usados = materialesUsados
      if (sanitizedAdditional?.tiempo_trabajado !== undefined && allowsWorkedTime) updateData.tiempo_trabajado = sanitizedAdditional.tiempo_trabajado
      if (sanitizedAdditional?.motivo_pausa !== undefined) updateData.motivo_pausa = sanitizedAdditional.motivo_pausa
      if (sanitizedAdditional?.fecha_servicio !== undefined) updateData.fecha_servicio = sanitizedAdditional.fecha_servicio
      if (sanitizedAdditional?.observaciones_tecnico) updateData.observaciones_tecnico = sanitizedAdditional.observaciones_tecnico
      if (sanitizedAdditional?.solucion_aplicada) updateData.solucion_aplicada = sanitizedAdditional.solucion_aplicada
      // If hourly billing, update monto_servicio with calculated amount
      if (sanitizedAdditional?.monto_servicio_final !== undefined && allowsWorkedTime) {
        updateData.monto_servicio = sanitizedAdditional.monto_servicio_final
      }

      if (!allowsWorkedTime && ticket.tipo === "servicio") {
        updateData.monto_servicio = DEFAULT_SERVICE_AMOUNT
        updateData.tiempo_trabajado = null
      }

      if (newStatus === "finalizado" && materialesUsados.length > 0) {
        const stockResult = await descontarStockMaterialesTicket(materialesUsados, id, currentUser.id)
        if (!stockResult.success) return { success: false, error: stockResult.error }
      }

      if (isRevertingFromFinalizado && materialesRegistrados.length > 0) {
        const reintegroResult = await reintegrarStockMaterialesTicket(materialesRegistrados, id, currentUser.id)
        if (!reintegroResult.success) return { success: false, error: reintegroResult.error }
      }

      await ref.update(updateData)

      // Create payment record when finalized
      if (newStatus === "finalizado" && ticket.tecnico_id) {
        const montoTicket = allowsWorkedTime
          ? (sanitizedAdditional?.monto_servicio_final ?? ticket.monto_servicio ?? DEFAULT_SERVICE_AMOUNT)
          : DEFAULT_SERVICE_AMOUNT
        const montoAPagar = montoTicket * (DEFAULT_COMMISSION_PERCENTAGE / 100)
        await db.collection("pagos").add(cleanForFirestore({
          ticket_id: id,
          tecnico_id: ticket.tecnico_id,
          monto_ticket: montoTicket,
          porcentaje_comision: DEFAULT_COMMISSION_PERCENTAGE,
          monto_a_pagar: montoAPagar,
          facturacion_tipo: ticket.facturacion_tipo ?? "fijo",
          estado_pago: "pendiente",
          fecha_habilitacion: now,
          created_at: now,
          updated_at: now,
        }))
      }

      const updated = fromFirestoreDoc<Ticket>(id, { ...snap.data()!, ...updateData })

      revalidatePath("/dashboard/tickets")
      revalidatePath(`/dashboard/tickets/${id}`)
      revalidatePath("/dashboard/pagos")

      return { success: true, data: updated, message: `Estado cambiado a ${newStatus}` }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function registerTicketArrival(ticketId: string): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) {
      return { success: false, error: "No tienes permiso para registrar llegada en este ticket" }
    }

    const updated = markDemoTicketArrival(ticketId)
    if (!updated) return { success: false, error: "No se pudo registrar la llegada" }
    addDemoUpdateLog({
      ticket_id: ticketId,
      autor_id: currentUser.id,
      contenido: "Llegó al sitio de servicio.",
      tipo: "nota",
      autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null },
    })
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: updated, message: "Llegada al sitio registrada" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(ticketId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Ticket no encontrado" }
      const ticket = fromFirestoreDoc<Ticket>(ticketId, snap.data()!)
      if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) {
        return { success: false, error: "No tienes permiso para registrar llegada en este ticket" }
      }

      const now = new Date().toISOString()
      const updates = cleanForFirestore({ fecha_llegada: ticket.fecha_llegada ?? now, estado_operativo: "en_sitio", updated_at: now })
      await ref.update(updates)

      const logRef = db.collection("update-logs").doc()
      const logData = cleanForFirestore({ ticket_id: ticketId, autor_id: currentUser.id, contenido: "Llegó al sitio de servicio.", tipo: "nota", created_at: now, updated_at: now, autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null } })
      await Promise.all([
        logRef.set(logData),
        db.collection("tickets").doc(ticketId).collection("update_logs").doc(logRef.id).set(logData),
      ])

      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, data: { ...ticket, ...updates } as Ticket, message: "Llegada al sitio registrada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function resumeTicketWork(ticketId: string): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) return { success: false, error: "No tienes permiso para reanudar este ticket" }
    const updated = resumeDemoTicketWork(ticketId, currentUser)
    if (!updated) return { success: false, error: "No se pudo reanudar el trabajo" }
    addDemoUpdateLog({ ticket_id: ticketId, autor_id: currentUser.id, contenido: "Trabajo reanudado.", tipo: "nota", autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null } })
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: updated, message: "Trabajo reanudado" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(ticketId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Ticket no encontrado" }
      const ticket = fromFirestoreDoc<Ticket>(ticketId, snap.data()!)
      if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) return { success: false, error: "No tienes permiso para reanudar este ticket" }

      const now = new Date().toISOString()
      const openSesion = await db.collection("ticket_sesiones_trabajo")
        .where("ticket_id", "==", ticketId)
        .where("tecnico_id", "==", currentUser.id)
        .where("fecha_fin", "==", null)
        .limit(1)
        .get()

      if (openSesion.empty) {
        await db.collection("ticket_sesiones_trabajo").add(cleanForFirestore({ ticket_id: ticketId, tecnico_id: currentUser.id, fecha_inicio: now, fecha_fin: null, duracion_minutos: null, notas: null, estado_al_inicio: ticket.estado, created_at: now }))
      }

      const updates = cleanForFirestore({ estado: ticket.estado === "asignado" ? "en_progreso" : ticket.estado, estado_operativo: "trabajando", fecha_inicio: ticket.fecha_inicio ?? now, fecha_ultima_reanudacion: now, motivo_pausa: null, updated_at: now })
      await ref.update(updates)
      const logRef = db.collection("update-logs").doc()
      const logData = cleanForFirestore({ ticket_id: ticketId, autor_id: currentUser.id, contenido: "Trabajo reanudado.", tipo: "nota", created_at: now, updated_at: now, autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null } })
      await Promise.all([logRef.set(logData), db.collection("tickets").doc(ticketId).collection("update_logs").doc(logRef.id).set(logData)])
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      return { success: true, data: { ...ticket, ...updates } as Ticket, message: "Trabajo reanudado" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function pauseTicketUntilTomorrow(ticketId: string, motivo: string, fechaServicio?: string): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (!motivo.trim()) return { success: false, error: "Debes indicar el motivo" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) return { success: false, error: "No tienes permiso para pausar este ticket" }
    const updated = pauseDemoTicketUntilTomorrow(ticketId, currentUser, motivo.trim(), fechaServicio)
    if (!updated) return { success: false, error: "No se pudo pausar el ticket" }
    addDemoUpdateLog({ ticket_id: ticketId, autor_id: currentUser.id, contenido: `Trabajo pausado. Motivo: ${motivo.trim()}`, tipo: "nota", autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null } })
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    revalidatePath("/dashboard/pipeline")
    return { success: true, data: updated, message: "Ticket pausado y reprogramado" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(ticketId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Ticket no encontrado" }
      const ticket = fromFirestoreDoc<Ticket>(ticketId, snap.data()!)
      if (currentUser.rol === "tecnico" && ticket.tecnico_id !== currentUser.id) return { success: false, error: "No tienes permiso para pausar este ticket" }

      const now = new Date().toISOString()
      await closeOpenWorkSession(ticketId, currentUser.id, motivo.trim())
      const workedMinutes = await getTotalWorkedMinutes(ticketId)
      const updates = cleanForFirestore({ estado: ticket.estado === "asignado" ? "en_progreso" : ticket.estado, estado_operativo: fechaServicio ? "reprogramado" : "pausado", fecha_ultima_pausa: now, fecha_servicio: fechaServicio || ticket.fecha_servicio || null, motivo_pausa: motivo.trim(), tiempo_trabajado: workedMinutes || ticket.tiempo_trabajado || null, updated_at: now })
      await ref.update(updates)
      const logRef = db.collection("update-logs").doc()
      const logData = cleanForFirestore({ ticket_id: ticketId, autor_id: currentUser.id, contenido: `Trabajo pausado. Motivo: ${motivo.trim()}`, tipo: "nota", created_at: now, updated_at: now, autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null } })
      await Promise.all([logRef.set(logData), db.collection("tickets").doc(ticketId).collection("update_logs").doc(logRef.id).set(logData)])
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      revalidatePath("/dashboard/pipeline")
      return { success: true, data: { ...ticket, ...updates } as Ticket, message: "Ticket pausado y reprogramado" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// ASIGNAR TÉCNICO
// ─────────────────────────────────────────────────────────────────────────────

export async function assignTechnician(
  ticketId: string,
  tecnicoId: string
): Promise<ActionResponse<Ticket>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    const isReassignment = ticket.tecnico_id !== null
    if (isReassignment && !hasPermission(currentUser, 'tickets:reassign'))
      return { success: false, error: "Solo Gerente o superior puede reasignar tecnicos" }
    if (!isReassignment && !hasPermission(currentUser, 'tickets:assign'))
      return { success: false, error: "No tienes permisos para asignar tecnicos" }
    const updatedTicket = assignDemoTechnician(ticketId, tecnicoId)
    if (!updatedTicket) return { success: false, error: "Tecnico no encontrado" }
    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return { success: true, data: updatedTicket, message: isReassignment ? "Tecnico reasignado" : "Tecnico asignado" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ref = db.collection("tickets").doc(ticketId)
      const snap = await ref.get()
      if (!snap.exists) return { success: false, error: "Ticket no encontrado" }

      const ticket = fromFirestoreDoc<Ticket>(ticketId, snap.data()!)
      const isReassignment = Boolean(ticket.tecnico_id)

      if (isReassignment && !hasPermission(currentUser, 'tickets:reassign'))
        return { success: false, error: "Solo Gerente o superior puede reasignar técnicos" }
      if (!isReassignment && !hasPermission(currentUser, 'tickets:assign'))
        return { success: false, error: "No tienes permisos para asignar técnicos" }

      const now = new Date().toISOString()
      await ref.update({ tecnico_id: tecnicoId, fecha_asignacion: now, updated_at: now })

      const updated = fromFirestoreDoc<Ticket>(ticketId, {
        ...snap.data()!, tecnico_id: tecnicoId, fecha_asignacion: now, updated_at: now,
      })

      revalidatePath("/dashboard/tickets")
      revalidatePath(`/dashboard/tickets/${ticketId}`)

      return {
        success: true,
        data: updated,
        message: isReassignment ? "Técnico reasignado" : "Técnico asignado",
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// ELIMINAR TICKET
// ─────────────────────────────────────────────────────────────────────────────

export async function deleteTicket(id: string): Promise<ActionResponse> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!hasPermission(currentUser, 'tickets:delete')) return { success: false, error: "No tienes permisos para eliminar tickets" }

  if (isLocalMode()) {
    const deleted = deleteDemoTicket(id)
    if (!deleted) return { success: false, error: "Ticket no encontrado" }
    revalidatePath("/dashboard/tickets")
    revalidatePath("/dashboard")
    return { success: true, message: "Ticket eliminado exitosamente" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ticketRef = db.collection("tickets").doc(id)
      const ticketSnap = await ticketRef.get()
      if (!ticketSnap.exists) return { success: false, error: "Ticket no encontrado" }

      const [fotosSnap, documentosSnap, pagosSnap, fasesSnap, inspeccionesSnap, sesionesSnap, logsSnap, ticketLogsSnap] = await Promise.all([
        db.collection("ticket_fotos").where("ticket_id", "==", id).get(),
        db.collection("ticket_documentos").where("ticket_id", "==", id).get(),
        db.collection("pagos").where("ticket_id", "==", id).get(),
        db.collection("ticket_fases").where("ticket_id", "==", id).get(),
        db.collection("inspecciones").where("ticket_id", "==", id).get(),
        db.collection("ticket_sesiones_trabajo").where("ticket_id", "==", id).get(),
        db.collection("update-logs").where("ticket_id", "==", id).get(),
        ticketRef.collection("update_logs").get(),
      ])

      const fotoFiles = fotosSnap.docs.map((doc) => fromFirestoreDoc<TicketFoto>(doc.id, doc.data()).storage_path)
      const documentoFiles = documentosSnap.docs.map((doc) => fromFirestoreDoc<TicketDocumento>(doc.id, doc.data()).storage_path)

      await Promise.allSettled([
        ...fotoFiles.map((path) => deleteFileFromStorage(path)),
        ...documentoFiles.map((path) => deleteFileFromStorage(path)),
      ])

      await Promise.all([
        ...fotosSnap.docs.map((doc) => doc.ref.delete()),
        ...documentosSnap.docs.map((doc) => doc.ref.delete()),
        ...pagosSnap.docs.map((doc) => doc.ref.delete()),
        ...fasesSnap.docs.map((doc) => doc.ref.delete()),
        ...inspeccionesSnap.docs.map((doc) => doc.ref.delete()),
        ...sesionesSnap.docs.map((doc) => doc.ref.delete()),
        ...logsSnap.docs.map((doc) => doc.ref.delete()),
        ...ticketLogsSnap.docs.map((doc) => doc.ref.delete()),
      ])

      await ticketRef.delete()
      revalidatePath("/dashboard/tickets")
      revalidatePath("/dashboard")
      return { success: true, message: "Ticket eliminado exitosamente" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// OBTENER TÉCNICOS DISPONIBLES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTechnicians(): Promise<ActionResponse<Array<{ id: string; nombre: string; apellido: string }>>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) return { success: true, data: getDemoTechnicians() }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const snap = await db.collection("users")
        .where("rol", "==", "tecnico")
        .where("estado", "==", "activo")
        .get()
      const data = snap.docs.map((d) => ({
        id: d.id,
        nombre: d.data().nombre as string,
        apellido: d.data().apellido as string,
      }))
      return { success: true, data }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIAL DE CAMBIOS
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketHistory(ticketId: string): Promise<ActionResponse<ChangeHistory[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!(await canAccessTicket(ticketId, currentUser))) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) return { success: true, data: [] }

  if (isFirebaseMode()) {
    // Historial is stored as an update-logs subcollection in Firebase
    return { success: true, data: [] }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// TIMELINE DE ACTUALIZACIONES
// ─────────────────────────────────────────────────────────────────────────────

export async function getTicketUpdateLogs(ticketId: string): Promise<ActionResponse<UpdateLog[]>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!(await canAccessTicket(ticketId, currentUser))) return { success: false, error: "Sin permisos" }

  if (isLocalMode()) return { success: true, data: getDemoUpdateLogs(ticketId) }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const [subcollectionSnap, legacySnap] = await Promise.all([
        db.collection("tickets").doc(ticketId).collection("update_logs").limit(100).get(),
        db.collection("update-logs").where("ticket_id", "==", ticketId).limit(100).get(),
      ])

      const merged = new Map<string, UpdateLog>()

      for (const d of subcollectionSnap.docs) {
        const log = fromFirestoreDoc<UpdateLog>(d.id, d.data())
        merged.set(log.id, log)
      }

      for (const d of legacySnap.docs) {
        const log = fromFirestoreDoc<UpdateLog>(d.id, d.data())
        if (!merged.has(log.id)) {
          merged.set(log.id, log)
        }
      }

      const logs = Array.from(merged.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )

      return { success: true, data: await fbHydrateUpdateLogs(logs) }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function addTicketUpdateLog(
  ticketId: string,
  contenido: string
): Promise<ActionResponse<UpdateLog>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!contenido.trim()) return { success: false, error: "El contenido no puede estar vacío" }

  if (isLocalMode()) {
    const ticket = getDemoTicketById(ticketId, currentUser)
    if (!ticket) return { success: false, error: "Ticket no encontrado" }
    const canAdd = currentUser.rol === "tecnico"
      ? ticket.tecnico_id === currentUser.id
      : hasPermission(currentUser, 'tickets:edit') || hasPermission(currentUser, 'tickets:change_status') || hasPermission(currentUser, 'tickets:view_all')
    if (!canAdd) return { success: false, error: "No tienes permiso para agregar actualizaciones" }
    const log = addDemoUpdateLog({
      ticket_id: ticketId, autor_id: currentUser.id, contenido: contenido.trim(), tipo: "nota",
      autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null },
    })
    return { success: true, data: log, message: "Actualización agregada" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const ticketSnap = await db.collection("tickets").doc(ticketId).get()
      if (!ticketSnap.exists) return { success: false, error: "Ticket no encontrado" }

      const ticket = fromFirestoreDoc<Ticket>(ticketId, ticketSnap.data()!)
      const canAdd = currentUser.rol === "tecnico"
        ? ticket.tecnico_id === currentUser.id
        : hasPermission(currentUser, 'tickets:edit') || hasPermission(currentUser, 'tickets:change_status') || hasPermission(currentUser, 'tickets:view_all')
      if (!canAdd) return { success: false, error: "No tienes permiso para agregar actualizaciones" }

      const now = new Date().toISOString()
      const logRef = db.collection("update-logs").doc()
      const ticketLogRef = db.collection("tickets").doc(ticketId).collection("update_logs").doc(logRef.id)
      const logData = cleanForFirestore({
        ticket_id: ticketId,
        autor_id: currentUser.id,
        contenido: contenido.trim(),
        tipo: "nota" as const,
        created_at: now,
        updated_at: now,
        autor: { nombre: currentUser.nombre, apellido: currentUser.apellido, rol: currentUser.rol, cargo: currentUser.cargo ?? null },
      })
      await Promise.all([logRef.set(logData), ticketLogRef.set(logData)])
      revalidatePath(`/dashboard/tickets/${ticketId}`)
      revalidatePath("/dashboard/tickets")

      const log: UpdateLog = { id: logRef.id, ...logData }
      return { success: true, data: log, message: "Actualización agregada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function updateTicketUpdateLog(ticketId: string, logId: string, contenido: string): Promise<ActionResponse<UpdateLog>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (!contenido.trim()) return { success: false, error: "El contenido no puede estar vacío" }

  if (isLocalMode()) {
    const existing = getDemoUpdateLogs(ticketId).find((log) => log.id === logId)
    if (!existing) return { success: false, error: "Entrada de bitácora no encontrada" }
    if (existing.tipo !== "nota") return { success: false, error: "Solo se pueden editar notas manuales" }

    const canManage = existing.autor_id === currentUser.id || hasPermission(currentUser, 'tickets:edit')
    if (!canManage) return { success: false, error: "No tienes permiso para editar esta actualización" }

    const updated = updateDemoUpdateLog(ticketId, logId, contenido.trim())
    if (!updated) return { success: false, error: "No se pudo actualizar la entrada" }

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    revalidatePath("/dashboard/tickets")
    return { success: true, data: updated, message: "Entrada de bitácora actualizada" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const logRef = db.collection("update-logs").doc(logId)
      const snap = await logRef.get()
      if (!snap.exists) return { success: false, error: "Entrada de bitácora no encontrada" }

      const existing = fromFirestoreDoc<UpdateLog>(snap.id, snap.data()!)
      if (existing.ticket_id !== ticketId) return { success: false, error: "La entrada no pertenece a este ticket" }
      if (existing.tipo !== "nota") return { success: false, error: "Solo se pueden editar notas manuales" }

      const canManage = existing.autor_id === currentUser.id || hasPermission(currentUser, 'tickets:edit')
      if (!canManage) return { success: false, error: "No tienes permiso para editar esta actualización" }

      const now = new Date().toISOString()
      const updates = cleanForFirestore({ contenido: contenido.trim(), updated_at: now })
      await Promise.all([
        logRef.update(updates),
        db.collection("tickets").doc(ticketId).collection("update_logs").doc(logId).set(updates, { merge: true }),
      ])

      revalidatePath(`/dashboard/tickets/${ticketId}`)
      revalidatePath("/dashboard/tickets")
      return { success: true, data: { ...existing, contenido: contenido.trim(), updated_at: now }, message: "Entrada de bitácora actualizada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

export async function deleteTicketUpdateLog(ticketId: string, logId: string): Promise<ActionResponse<{ id: string }>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  if (isLocalMode()) {
    const existing = getDemoUpdateLogs(ticketId).find((log) => log.id === logId)
    if (!existing) return { success: false, error: "Entrada de bitácora no encontrada" }
    if (existing.tipo !== "nota") return { success: false, error: "Solo se pueden eliminar notas manuales" }

    const canManage = existing.autor_id === currentUser.id || hasPermission(currentUser, 'tickets:edit')
    if (!canManage) return { success: false, error: "No tienes permiso para eliminar esta actualización" }

    const deleted = deleteDemoUpdateLog(ticketId, logId)
    if (!deleted) return { success: false, error: "No se pudo eliminar la entrada" }

    revalidatePath(`/dashboard/tickets/${ticketId}`)
    revalidatePath("/dashboard/tickets")
    return { success: true, data: { id: logId }, message: "Entrada de bitácora eliminada" }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const logRef = db.collection("update-logs").doc(logId)
      const snap = await logRef.get()
      if (!snap.exists) return { success: false, error: "Entrada de bitácora no encontrada" }

      const existing = fromFirestoreDoc<UpdateLog>(snap.id, snap.data()!)
      if (existing.ticket_id !== ticketId) return { success: false, error: "La entrada no pertenece a este ticket" }
      if (existing.tipo !== "nota") return { success: false, error: "Solo se pueden eliminar notas manuales" }

      const canManage = existing.autor_id === currentUser.id || hasPermission(currentUser, 'tickets:edit')
      if (!canManage) return { success: false, error: "No tienes permiso para eliminar esta actualización" }

      await Promise.all([
        logRef.delete(),
        db.collection("tickets").doc(ticketId).collection("update_logs").doc(logId).delete(),
      ])

      revalidatePath(`/dashboard/tickets/${ticketId}`)
      revalidatePath("/dashboard/tickets")
      return { success: true, data: { id: logId }, message: "Entrada de bitácora eliminada" }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERTIR INSPECCIÓN → SERVICIO / PROYECTO
// ─────────────────────────────────────────────────────────────────────────────

export async function convertirInspeccion(
  ticketId: string,
  tipo: "servicio" | "proyecto"
): Promise<ActionResponse<{ ticketId: string; numero: string }>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }
  if (ROLE_HIERARCHY[currentUser.rol] < 2)
    return { success: false, error: "Sin permiso para convertir inspecciones" }

  if (isLocalMode()) {
    const result = createDemoConvertirInspeccion(ticketId, tipo, currentUser)
    if (!result) return { success: false, error: "Ticket de inspección no encontrado o ya fue convertido" }
    revalidatePath("/dashboard/tickets")
    revalidatePath(`/dashboard/tickets/${ticketId}`)
    return {
      success: true,
      data: { ticketId: result.nuevoTicket.id, numero: result.nuevoTicket.numero_ticket },
      message: `Inspección convertida a ${tipo}: ${result.nuevoTicket.numero_ticket}`,
    }
  }

  if (isFirebaseMode()) {
    try {
      const db = getAdminFirestore()
      const origSnap = await db.collection("tickets").doc(ticketId).get()
      if (!origSnap.exists) return { success: false, error: "Ticket no encontrado" }

      const inspeccion = fromFirestoreDoc<Ticket>(ticketId, origSnap.data()!)
      if (inspeccion.tipo !== "inspeccion") return { success: false, error: "El ticket no es una inspección" }
      if (inspeccion.ticket_derivado_id) return { success: false, error: "Esta inspección ya fue convertida" }

      // Get next sequence
      const all = await fbGetAllTickets()
      const ofType = all.filter((t) => t.tipo === tipo)
      const nums = ofType.map((t) => {
        const m = t.numero_ticket?.match(/(\d{4})$/)
        return m ? parseInt(m[1]) : 0
      })
      const nextSeq = nums.length > 0 ? Math.max(...nums) + 1 : 1
      const nuevoNumero = generateTicketNumber(tipo, nextSeq)

      const now = new Date().toISOString()
      const newRef = db.collection("tickets").doc()
      const newTicketData = cleanForFirestore({
        numero_ticket: nuevoNumero,
        tipo,
        cliente_nombre: inspeccion.cliente_nombre,
        cliente_empresa: inspeccion.cliente_empresa || null,
        cliente_email: inspeccion.cliente_email || null,
        cliente_telefono: inspeccion.cliente_telefono,
        cliente_direccion: inspeccion.cliente_direccion,
        asunto: tipo === "servicio" ? "Servicio derivado de inspección" : "Proyecto derivado de inspección",
        descripcion: inspeccion.descripcion,
        requerimientos: inspeccion.requerimientos || null,
        prioridad: inspeccion.prioridad,
        origen: inspeccion.origen,
        tecnico_id: inspeccion.tecnico_id || null,
        creado_por: currentUser.id,
        estado: "asignado",
        monto_servicio: tipo === "servicio" ? DEFAULT_SERVICE_AMOUNT : 0,
        ticket_origen_id: ticketId,
        ticket_derivado_id: null,
        created_at: now,
        updated_at: now,
      })
      await newRef.set(newTicketData)

      await db.collection("tickets").doc(ticketId).update({
        ticket_derivado_id: newRef.id,
        updated_at: now,
      })

      revalidatePath("/dashboard/tickets")
      revalidatePath(`/dashboard/tickets/${ticketId}`)

      return {
        success: true,
        data: { ticketId: newRef.id, numero: nuevoNumero },
        message: `Inspección convertida a ${tipo}: ${nuevoNumero}`,
      }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  return { success: false, error: "Tickets requiere configuración Firebase válida" }
}
