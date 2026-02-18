import {
  DEFAULT_COMMISSION_PERCENTAGE,
  ROLE_HIERARCHY,
  VALID_TRANSITIONS,
  generateTicketNumber,
} from "@/types"
import type {
  ActivityFeedItem,
  ChangeType,
  DashboardStats,
  EnhancedDashboardStats,
  FaseEstado,
  Inspeccion,
  InspeccionCreateInput,
  PaginatedResponse,
  PaymentMethod,
  SesionTrabajo,
  SystemConfig,
  TechnicianKPI,
  TechnicianPayment,
  Ticket,
  TicketCreateInput,
  TicketFase,
  TicketFoto,
  TicketPriority,
  TicketStatus,
  TicketUpdateInput,
  TipoFoto,
  User,
} from "@/types"

const now = Date.now()
const hour = 60 * 60 * 1000

const DEMO_USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Admin",
    apellido: "Sistema",
    email: "admin@copselectronics.com",
    rol: "presidente",
    nivel_jerarquico: 5,
    telefono: "+58 414 000 0000",
    cedula: "V-00000000",
    estado: "activo",
    created_at: new Date(now - 72 * hour).toISOString(),
    updated_at: new Date(now - 72 * hour).toISOString(),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    nombre: "Ana",
    apellido: "Coordinacion",
    email: "ana.coordinacion@copselectronics.com",
    rol: "coordinador",
    nivel_jerarquico: 2,
    telefono: "+58 424 111 1111",
    cedula: "V-11111111",
    estado: "activo",
    created_at: new Date(now - 72 * hour).toISOString(),
    updated_at: new Date(now - 72 * hour).toISOString(),
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    nombre: "Carlos",
    apellido: "Tecnico",
    email: "carlos.tecnico@copselectronics.com",
    rol: "tecnico",
    nivel_jerarquico: 1,
    telefono: "+58 412 222 2222",
    cedula: "V-22222222",
    estado: "activo",
    created_at: new Date(now - 72 * hour).toISOString(),
    updated_at: new Date(now - 72 * hour).toISOString(),
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    nombre: "Maria",
    apellido: "Tecnica",
    email: "maria.tecnica@copselectronics.com",
    rol: "tecnico",
    nivel_jerarquico: 1,
    telefono: "+58 414 333 3333",
    cedula: "V-33333333",
    estado: "activo",
    created_at: new Date(now - 72 * hour).toISOString(),
    updated_at: new Date(now - 72 * hour).toISOString(),
  },
]

function findUser(id: string): User | undefined {
  return DEMO_USERS.find((user) => user.id === id)
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function buildTicket(partial: Partial<Ticket> & Pick<Ticket, "id" | "numero_ticket">): Ticket {
  const createdBy = findUser("22222222-2222-2222-2222-222222222222")!
  const tecnico = partial.tecnico_id ? findUser(partial.tecnico_id) : undefined
  const createdAt = partial.created_at ?? new Date().toISOString()

  return {
    id: partial.id,
    numero_ticket: partial.numero_ticket,
    tipo: partial.tipo ?? "servicio",
    cliente_nombre: partial.cliente_nombre ?? "Cliente Demo",
    cliente_empresa: partial.cliente_empresa ?? "Empresa Demo",
    cliente_email: partial.cliente_email ?? "cliente@empresa.com",
    cliente_telefono: partial.cliente_telefono ?? "+58 424 000 0000",
    cliente_direccion: partial.cliente_direccion ?? "Caracas, Venezuela",
    asunto: partial.asunto ?? "Servicio preventivo",
    descripcion:
      partial.descripcion ??
      "Revision del sistema, chequeo de equipos y validacion de operacion.",
    requerimientos:
      partial.requerimientos ??
      "Acceso a gabinetes, conectividad de red y punto electrico disponible.",
    materiales_planificados: partial.materiales_planificados ?? null,
    prioridad: partial.prioridad ?? "media",
    origen: partial.origen ?? "email",
    carta_aceptacion_path: partial.carta_aceptacion_path ?? null,
    creado_por: partial.creado_por ?? createdBy.id,
    tecnico_id: partial.tecnico_id ?? null,
    estado: partial.estado ?? "asignado",
    fecha_asignacion: partial.fecha_asignacion ?? createdAt,
    fecha_inicio: partial.fecha_inicio ?? null,
    fecha_finalizacion: partial.fecha_finalizacion ?? null,
    materiales_usados: partial.materiales_usados ?? null,
    tiempo_trabajado: partial.tiempo_trabajado ?? null,
    observaciones_tecnico: partial.observaciones_tecnico ?? null,
    solucion_aplicada: partial.solucion_aplicada ?? null,
    comprobante_path: partial.comprobante_path ?? null,
    monto_servicio: partial.monto_servicio ?? 40,
    modificado_por: partial.modificado_por ?? null,
    fecha_ultima_modificacion: partial.fecha_ultima_modificacion ?? null,
    created_at: createdAt,
    updated_at: partial.updated_at ?? createdAt,
    creador: partial.creador ?? createdBy,
    tecnico: partial.tecnico ?? tecnico,
    modificador: partial.modificador,
  }
}

function getInitialTickets(): Ticket[] {
  return [
    buildTicket({
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      numero_ticket: "TKT-2026-0001",
      cliente_nombre: "Banco Nacional",
      cliente_empresa: "Banco Nacional C.A.",
      asunto: "Mantenimiento de CCTV en sede principal",
      prioridad: "alta",
      estado: "en_progreso",
      tecnico_id: "33333333-3333-3333-3333-333333333333",
      created_at: new Date(now - 48 * hour).toISOString(),
      fecha_asignacion: new Date(now - 47 * hour).toISOString(),
      fecha_inicio: new Date(now - 36 * hour).toISOString(),
      monto_servicio: 40,
    }),
    buildTicket({
      id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      numero_ticket: "PRY-2026-0001",
      tipo: "proyecto",
      cliente_nombre: "Centro Empresarial Hallandale",
      cliente_empresa: "CEH Group",
      asunto: "Integracion de control de acceso multi-sede",
      prioridad: "urgente",
      estado: "asignado",
      tecnico_id: "44444444-4444-4444-4444-444444444444",
      created_at: new Date(now - 20 * hour).toISOString(),
      fecha_asignacion: new Date(now - 19 * hour).toISOString(),
      monto_servicio: 750,
    }),
    buildTicket({
      id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      numero_ticket: "TKT-2026-0002",
      cliente_nombre: "Clinica del Norte",
      cliente_empresa: "Salud Norte",
      asunto: "Reemplazo de fuente UPS",
      prioridad: "media",
      estado: "finalizado",
      tecnico_id: "33333333-3333-3333-3333-333333333333",
      created_at: new Date(now - 72 * hour).toISOString(),
      fecha_asignacion: new Date(now - 71 * hour).toISOString(),
      fecha_inicio: new Date(now - 70 * hour).toISOString(),
      fecha_finalizacion: new Date(now - 68 * hour).toISOString(),
      tiempo_trabajado: 180,
      solucion_aplicada: "Fuente UPS sustituida y banco de baterias recalibrado.",
      observaciones_tecnico: "Sistema estable y sin alarmas.",
      monto_servicio: 120,
    }),
  ]
}

let demoTickets: Ticket[] = getInitialTickets()

function buildPaymentFromTicket(ticket: Ticket): TechnicianPayment {
  const nowIso = new Date().toISOString()
  const montoAPagar = Number(
    (ticket.monto_servicio * (DEFAULT_COMMISSION_PERCENTAGE / 100)).toFixed(2)
  )

  return {
    id: `pay-${ticket.id}`,
    ticket_id: ticket.id,
    tecnico_id: ticket.tecnico_id ?? "33333333-3333-3333-3333-333333333333",
    monto_ticket: ticket.monto_servicio,
    porcentaje_comision: DEFAULT_COMMISSION_PERCENTAGE,
    monto_a_pagar: montoAPagar,
    estado_pago: ticket.estado === "finalizado" ? "pendiente" : "pendiente",
    fecha_habilitacion: ticket.fecha_finalizacion ?? nowIso,
    fecha_pago: null,
    metodo_pago: null,
    referencia_pago: null,
    pagado_por: null,
    observaciones: null,
    created_at: nowIso,
    updated_at: nowIso,
    ticket,
    tecnico: ticket.tecnico,
    pagador: undefined,
  }
}

let demoPayments: TechnicianPayment[] = demoTickets
  .filter((ticket) => ticket.estado === "finalizado" && ticket.tecnico_id)
  .map((ticket) => buildPaymentFromTicket(ticket))

export function getDemoCurrentUser(): User {
  return deepClone(DEMO_USERS[0]!)
}

export function getDemoUsers(): User[] {
  return deepClone(DEMO_USERS).sort(
    (a, b) => ROLE_HIERARCHY[b.rol] - ROLE_HIERARCHY[a.rol]
  )
}

export function getDemoTechnicians(): Array<{ id: string; nombre: string; apellido: string }> {
  return deepClone(
    DEMO_USERS.filter((user) => user.rol === "tecnico" && user.estado === "activo").map(
      (user) => ({
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
      })
    )
  )
}

function getVisibleTickets(user: User): Ticket[] {
  if (user.rol === "tecnico") {
    return demoTickets.filter((ticket) => ticket.tecnico_id === user.id)
  }

  return demoTickets
}

export function getDemoTicketsPage(
  options: {
    page?: number
    pageSize?: number
    status?: TicketStatus
    priority?: string
    tecnicoId?: string
    search?: string
  } = {},
  user: User
): PaginatedResponse<Ticket> {
  const page = options.page || 1
  const pageSize = options.pageSize || 10

  let filtered = getVisibleTickets(user)

  if (options.status) {
    filtered = filtered.filter((ticket) => ticket.estado === options.status)
  }

  if (options.priority) {
    filtered = filtered.filter((ticket) => ticket.prioridad === options.priority)
  }

  if (options.tecnicoId) {
    filtered = filtered.filter((ticket) => ticket.tecnico_id === options.tecnicoId)
  }

  if (options.search) {
    const search = options.search.toLowerCase()
    filtered = filtered.filter((ticket) => {
      const text = `${ticket.numero_ticket} ${ticket.cliente_nombre} ${ticket.asunto}`.toLowerCase()
      return text.includes(search)
    })
  }

  filtered = [...filtered].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const offset = (page - 1) * pageSize
  const pageData = filtered.slice(offset, offset + pageSize)

  return {
    data: deepClone(pageData),
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
  }
}

export function getDemoTicketById(id: string, user: User): Ticket | null {
  const ticket = demoTickets.find((item) => item.id === id)
  if (!ticket) {
    return null
  }

  if (user.rol === "tecnico" && ticket.tecnico_id !== user.id) {
    return null
  }

  return deepClone(ticket)
}

export function getDemoDashboardStats(user: User): DashboardStats {
  const visible = getVisibleTickets(user)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const byStatus = (status: TicketStatus) =>
    visible.filter((ticket) => ticket.estado === status).length

  const byPriority = (priority: TicketPriority) =>
    visible.filter(
      (ticket) =>
        ticket.prioridad === priority &&
        ticket.estado !== "finalizado" &&
        ticket.estado !== "cancelado"
    ).length

  const pendingPayments = ROLE_HIERARCHY[user.rol] >= 3
    ? demoPayments.filter((payment) => payment.estado_pago === "pendiente")
    : []

  return {
    ticketsTotal: visible.length,
    ticketsHoy: visible.filter((ticket) => new Date(ticket.created_at) >= today).length,
    ticketsPendientes: visible.filter(
      (ticket) => ticket.estado !== "finalizado" && ticket.estado !== "cancelado"
    ).length,
    ticketsFinalizados: byStatus("finalizado"),
    pagosPendientes: pendingPayments.length,
    montosPendientes: pendingPayments.reduce(
      (sum, payment) => sum + Number(payment.monto_a_pagar),
      0
    ),
    ticketsPorEstado: {
      asignado: byStatus("asignado"),
      iniciado: byStatus("iniciado"),
      en_progreso: byStatus("en_progreso"),
      finalizado: byStatus("finalizado"),
      cancelado: byStatus("cancelado"),
    },
    ticketsPorPrioridad: {
      baja: byPriority("baja"),
      media: byPriority("media"),
      alta: byPriority("alta"),
      urgente: byPriority("urgente"),
    },
  }
}

function getNextSequence(tipo: "servicio" | "proyecto"): number {
  const current = demoTickets
    .filter((ticket) => ticket.tipo === tipo)
    .map((ticket) => {
      const match = ticket.numero_ticket.match(/(\d{4})$/)
      return match ? Number(match[1]) : 0
    })
    .reduce((max, value) => Math.max(max, value), 0)

  return current + 1
}

export function createDemoTicket(input: TicketCreateInput, currentUser: User): Ticket {
  const numeroTicket = generateTicketNumber(input.tipo, getNextSequence(input.tipo))
  const nowIso = new Date().toISOString()
  const tecnico = input.tecnico_id ? findUser(input.tecnico_id) : undefined

  const ticket = buildTicket({
    id: crypto.randomUUID(),
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
    creador: currentUser,
    tecnico_id: input.tecnico_id || null,
    tecnico,
    estado: "asignado",
    fecha_asignacion: nowIso,
    monto_servicio: input.monto_servicio ?? 40,
    created_at: nowIso,
    updated_at: nowIso,
  })

  demoTickets = [ticket, ...demoTickets]
  return deepClone(ticket)
}

export function updateDemoTicket(
  id: string,
  input: TicketUpdateInput,
  currentUser: User
): Ticket | null {
  const index = demoTickets.findIndex((ticket) => ticket.id === id)
  if (index < 0) {
    return null
  }

  const current = demoTickets[index]
  const tecnico =
    input.tecnico_id === undefined
      ? current.tecnico
      : input.tecnico_id
      ? findUser(input.tecnico_id)
      : undefined

  const updated: Ticket = {
    ...current,
    ...input,
    tecnico_id: input.tecnico_id === undefined ? current.tecnico_id : input.tecnico_id || null,
    tecnico: tecnico ?? undefined,
    modificado_por: currentUser.id,
    modificador: currentUser,
    fecha_ultima_modificacion: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  demoTickets[index] = updated
  return deepClone(updated)
}

export function changeDemoTicketStatus(
  id: string,
  newStatus: TicketStatus,
  additionalData?: {
    materiales_usados?: Array<{ id: string; nombre: string; cantidad: number; unidad: string }>
    tiempo_trabajado?: number
    observaciones_tecnico?: string
    solucion_aplicada?: string
  }
): { ticket?: Ticket; error?: string } {
  const index = demoTickets.findIndex((ticket) => ticket.id === id)
  if (index < 0) {
    return { error: "Ticket no encontrado" }
  }

  const current = demoTickets[index]
  const validTransitions = VALID_TRANSITIONS[current.estado]
  if (!validTransitions.includes(newStatus)) {
    return { error: `No se puede cambiar de ${current.estado} a ${newStatus}` }
  }

  const updateData: Partial<Ticket> = {
    estado: newStatus,
    updated_at: new Date().toISOString(),
  }

  if (newStatus === "iniciado" && !current.fecha_inicio) {
    updateData.fecha_inicio = new Date().toISOString()
  }

  if (newStatus === "finalizado") {
    updateData.fecha_finalizacion = new Date().toISOString()
  }

  if (additionalData?.materiales_usados) {
    updateData.materiales_usados = additionalData.materiales_usados
  }

  if (additionalData?.tiempo_trabajado !== undefined) {
    updateData.tiempo_trabajado = additionalData.tiempo_trabajado
  }

  if (additionalData?.observaciones_tecnico) {
    updateData.observaciones_tecnico = additionalData.observaciones_tecnico
  }

  if (additionalData?.solucion_aplicada) {
    updateData.solucion_aplicada = additionalData.solucion_aplicada
  }

  const updated: Ticket = { ...current, ...updateData }
  demoTickets[index] = updated

  if (newStatus === "finalizado" && updated.tecnico_id) {
    const existing = demoPayments.find((payment) => payment.ticket_id === updated.id)
    if (!existing) {
      demoPayments = [buildPaymentFromTicket(updated), ...demoPayments]
    }
  }

  return { ticket: deepClone(updated) }
}

export function assignDemoTechnician(ticketId: string, tecnicoId: string): Ticket | null {
  const index = demoTickets.findIndex((ticket) => ticket.id === ticketId)
  if (index < 0) {
    return null
  }

  const tecnico = findUser(tecnicoId)
  if (!tecnico || tecnico.rol !== "tecnico") {
    return null
  }

  const updated: Ticket = {
    ...demoTickets[index],
    tecnico_id: tecnicoId,
    tecnico,
    fecha_asignacion: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  demoTickets[index] = updated
  return deepClone(updated)
}

export function deleteDemoTicket(id: string): boolean {
  const initialLength = demoTickets.length
  demoTickets = demoTickets.filter((ticket) => ticket.id !== id)
  demoPayments = demoPayments.filter((payment) => payment.ticket_id !== id)
  demoFases = demoFases.filter((fase) => fase.ticket_id !== id)
  demoFotos = demoFotos.filter((foto) => foto.ticket_id !== id)
  demoSesiones = demoSesiones.filter((sesion) => sesion.ticket_id !== id)
  demoInspecciones = demoInspecciones.filter((insp) => insp.ticket_id !== id)
  return demoTickets.length < initialLength
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA v2 — Fases, Fotos, Sesiones, Inspecciones, Dashboard Mejorado
// ═══════════════════════════════════════════════════════════════════════════

// ─── Fases de Proyecto ───────────────────────────────────────────────────────

let demoFases: TicketFase[] = [
  {
    id: "fase-1111-1111-1111-1111",
    ticket_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    nombre: "Relevamiento y Diseño",
    descripcion: "Levantamiento de planos, diseño de red de acceso y aprobación del cliente.",
    orden: 0,
    estado: "completada",
    progreso_porcentaje: 100,
    fecha_inicio_estimada: new Date(now - 18 * hour).toISOString(),
    fecha_fin_estimada: new Date(now - 10 * hour).toISOString(),
    fecha_inicio_real: new Date(now - 19 * hour).toISOString(),
    fecha_fin_real: new Date(now - 12 * hour).toISOString(),
    created_at: new Date(now - 20 * hour).toISOString(),
    updated_at: new Date(now - 12 * hour).toISOString(),
  },
  {
    id: "fase-2222-2222-2222-2222",
    ticket_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    nombre: "Instalación de Controladoras",
    descripcion: "Instalación de controladoras de acceso en cada sede del CEH Group.",
    orden: 1,
    estado: "en_progreso",
    progreso_porcentaje: 40,
    fecha_inicio_estimada: new Date(now - 8 * hour).toISOString(),
    fecha_fin_estimada: new Date(now + 16 * hour).toISOString(),
    fecha_inicio_real: new Date(now - 6 * hour).toISOString(),
    fecha_fin_real: null,
    created_at: new Date(now - 20 * hour).toISOString(),
    updated_at: new Date(now - 2 * hour).toISOString(),
  },
  {
    id: "fase-3333-3333-3333-3333",
    ticket_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    nombre: "Configuración y Pruebas",
    descripcion: "Configuración del sistema de control de acceso y pruebas funcionales.",
    orden: 2,
    estado: "pendiente",
    progreso_porcentaje: 0,
    fecha_inicio_estimada: new Date(now + 16 * hour).toISOString(),
    fecha_fin_estimada: new Date(now + 32 * hour).toISOString(),
    fecha_inicio_real: null,
    fecha_fin_real: null,
    created_at: new Date(now - 20 * hour).toISOString(),
    updated_at: new Date(now - 20 * hour).toISOString(),
  },
]

export function getDemoFasesByTicket(ticketId: string): TicketFase[] {
  return deepClone(demoFases.filter((f) => f.ticket_id === ticketId).sort((a, b) => a.orden - b.orden))
}

export function createDemoFase(input: { ticket_id: string; nombre: string; descripcion?: string; orden?: number; fecha_inicio_estimada?: string; fecha_fin_estimada?: string }, _currentUser: User): TicketFase {
  const existing = demoFases.filter((f) => f.ticket_id === input.ticket_id)
  const maxOrden = existing.length > 0 ? Math.max(...existing.map((f) => f.orden)) : -1
  const fase: TicketFase = {
    id: crypto.randomUUID(),
    ticket_id: input.ticket_id,
    nombre: input.nombre,
    descripcion: input.descripcion || null,
    orden: input.orden ?? maxOrden + 1,
    estado: "pendiente",
    progreso_porcentaje: 0,
    fecha_inicio_estimada: input.fecha_inicio_estimada || null,
    fecha_fin_estimada: input.fecha_fin_estimada || null,
    fecha_inicio_real: null,
    fecha_fin_real: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  demoFases = [...demoFases, fase]
  return deepClone(fase)
}

export function updateDemoFase(id: string, input: { nombre?: string; descripcion?: string; estado?: FaseEstado; progreso_porcentaje?: number; fecha_inicio_estimada?: string; fecha_fin_estimada?: string }): TicketFase | null {
  const index = demoFases.findIndex((f) => f.id === id)
  if (index < 0) return null
  const updated: TicketFase = {
    ...demoFases[index]!,
    ...input,
    descripcion: input.descripcion ?? demoFases[index]!.descripcion,
    updated_at: new Date().toISOString(),
  }
  if (input.estado === "completada" && !updated.fecha_fin_real) {
    updated.fecha_fin_real = new Date().toISOString()
    updated.progreso_porcentaje = 100
  }
  if (input.estado === "en_progreso" && !updated.fecha_inicio_real) {
    updated.fecha_inicio_real = new Date().toISOString()
  }
  demoFases[index] = updated
  return deepClone(updated)
}

export function deleteDemoFase(id: string): boolean {
  const initial = demoFases.length
  demoFases = demoFases.filter((f) => f.id !== id)
  return demoFases.length < initial
}

// ─── Fotos de Ticket ──────────────────────────────────────────────────────────

let demoFotos: TicketFoto[] = [
  {
    id: "foto-aaaa-aaaa-aaaa-aaaa",
    ticket_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    subido_por: "33333333-3333-3333-3333-333333333333",
    storage_path: "demo/placeholder-cctv.jpg",
    nombre_archivo: "foto-cctv-instalacion.jpg",
    tipo_foto: "progreso",
    descripcion: "Instalación de cámara en pasillo principal",
    tamanio_bytes: 2048000,
    mime_type: "image/jpeg",
    created_at: new Date(now - 20 * hour).toISOString(),
    url: "https://placehold.co/800x600/1e3a5f/4a90d9?text=Foto+Progreso",
  },
  {
    id: "foto-bbbb-bbbb-bbbb-bbbb",
    ticket_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    subido_por: "33333333-3333-3333-3333-333333333333",
    storage_path: "demo/placeholder-antes.jpg",
    nombre_archivo: "estado-antes.jpg",
    tipo_foto: "antes",
    descripcion: "Estado inicial del sistema CCTV",
    tamanio_bytes: 1800000,
    mime_type: "image/jpeg",
    created_at: new Date(now - 36 * hour).toISOString(),
    url: "https://placehold.co/800x600/2d1b69/9f7aea?text=Estado+Antes",
  },
]

export function getDemoFotosByTicket(ticketId: string, tipoFoto?: TipoFoto): TicketFoto[] {
  let fotos = demoFotos.filter((f) => f.ticket_id === ticketId)
  if (tipoFoto) fotos = fotos.filter((f) => f.tipo_foto === tipoFoto)
  return deepClone(fotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
}

export function createDemoFoto(ticketId: string, input: { nombre_archivo: string; tipo_foto: TipoFoto; descripcion?: string }, currentUser: User): TicketFoto {
  const foto: TicketFoto = {
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    subido_por: currentUser.id,
    storage_path: `demo/${Date.now()}-${input.nombre_archivo}`,
    nombre_archivo: input.nombre_archivo,
    tipo_foto: input.tipo_foto,
    descripcion: input.descripcion || null,
    tamanio_bytes: null,
    mime_type: "image/jpeg",
    created_at: new Date().toISOString(),
    url: "https://placehold.co/800x600/1e3a5f/4a90d9?text=Foto+Demo",
    subidor: currentUser,
  }
  demoFotos = [foto, ...demoFotos]
  return deepClone(foto)
}

export function deleteDemoFoto(id: string, userId: string, userLevel: number): boolean {
  const foto = demoFotos.find((f) => f.id === id)
  if (!foto) return false
  if (foto.subido_por !== userId && userLevel < 3) return false
  demoFotos = demoFotos.filter((f) => f.id !== id)
  return true
}

// ─── Sesiones de Trabajo ─────────────────────────────────────────────────────

let demoSesiones: SesionTrabajo[] = []

export function getDemoSesionesByTicket(ticketId: string): SesionTrabajo[] {
  return deepClone(demoSesiones.filter((s) => s.ticket_id === ticketId).sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()))
}

export function iniciarDemoSesion(ticketId: string, currentUser: User): SesionTrabajo {
  const sesion: SesionTrabajo = {
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    tecnico_id: currentUser.id,
    fecha_inicio: new Date().toISOString(),
    fecha_fin: null,
    duracion_minutos: null,
    notas: null,
    estado_al_inicio: demoTickets.find((t) => t.id === ticketId)?.estado || null,
    created_at: new Date().toISOString(),
    tecnico: currentUser,
  }
  demoSesiones = [sesion, ...demoSesiones]
  return deepClone(sesion)
}

export function finalizarDemoSesion(sesionId: string, notas?: string): SesionTrabajo | null {
  const index = demoSesiones.findIndex((s) => s.id === sesionId)
  if (index < 0) return null
  const sesion = demoSesiones[index]!
  const fechaFin = new Date()
  const fechaInicio = new Date(sesion.fecha_inicio)
  const duracion = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / 60000)
  const updated: SesionTrabajo = {
    ...sesion,
    fecha_fin: fechaFin.toISOString(),
    duracion_minutos: duracion,
    notas: notas || null,
  }
  demoSesiones[index] = updated
  return deepClone(updated)
}

// ─── Inspecciones ─────────────────────────────────────────────────────────────

let demoInspecciones: Inspeccion[] = []

export function getDemoInspeccionByTicket(ticketId: string): Inspeccion | null {
  const insp = demoInspecciones.find((i) => i.ticket_id === ticketId)
  return insp ? deepClone(insp) : null
}

export function createDemoInspeccion(ticketId: string, input: InspeccionCreateInput, currentUser: User): Inspeccion {
  const insp: Inspeccion = {
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    realizado_por: currentUser.id,
    fecha_inspeccion: new Date().toISOString(),
    datos_checklist: input.datos_checklist,
    observaciones_generales: input.observaciones_generales || null,
    recomendaciones: input.recomendaciones || null,
    materiales_requeridos: input.materiales_requeridos || [],
    estado: "borrador",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    tecnico: currentUser,
    fotos: [],
  }
  demoInspecciones = [insp, ...demoInspecciones]
  return deepClone(insp)
}

export function updateDemoInspeccion(id: string, input: Partial<InspeccionCreateInput> & { estado?: "borrador" | "completada" | "reportada" }): Inspeccion | null {
  const index = demoInspecciones.findIndex((i) => i.id === id)
  if (index < 0) return null
  const updated: Inspeccion = {
    ...demoInspecciones[index]!,
    ...input,
    updated_at: new Date().toISOString(),
  }
  demoInspecciones[index] = updated
  return deepClone(updated)
}

// ─── Dashboard Mejorado ───────────────────────────────────────────────────────

export function getDemoEnhancedStats(user: User): EnhancedDashboardStats {
  const base = getDemoDashboardStats(user)

  // Revenue calculado desde tickets finalizados
  const finalizados = demoTickets.filter((t) => t.estado === "finalizado")
  const ingresoTotal = finalizados.reduce((sum, t) => sum + t.monto_servicio, 0)

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  const ingresoEsteMes = finalizados
    .filter((t) => t.fecha_finalizacion && new Date(t.fecha_finalizacion) >= inicioMes)
    .reduce((sum, t) => sum + t.monto_servicio, 0)

  const ingresoPendiente = demoPayments
    .filter((p) => p.estado_pago === "pendiente")
    .reduce((sum, p) => sum + p.monto_a_pagar, 0)

  // KPIs por técnico
  const tecnicos = DEMO_USERS.filter((u) => u.rol === "tecnico")
  const technicianKPIs: TechnicianKPI[] = tecnicos.map((tec) => {
    const tecTickets = demoTickets.filter((t) => t.tecnico_id === tec.id)
    const completados = tecTickets.filter((t) => t.estado === "finalizado")
    const activos = tecTickets.filter((t) => !["finalizado", "cancelado"].includes(t.estado))
    const tiempos = completados.filter((t) => t.tiempo_trabajado).map((t) => t.tiempo_trabajado!)
    const tiempoPromedio = tiempos.length > 0 ? Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length) : 0
    const montoTotal = completados.reduce((sum, t) => sum + t.monto_servicio, 0)
    const pagTec = demoPayments.filter((p) => p.tecnico_id === tec.id)
    const montoPendiente = pagTec.filter((p) => p.estado_pago === "pendiente").reduce((sum, p) => sum + p.monto_a_pagar, 0)
    return {
      id: tec.id,
      nombre: tec.nombre,
      apellido: tec.apellido,
      ticketsCompletados: completados.length,
      ticketsActivos: activos.length,
      tiempoPromedioMinutos: tiempoPromedio,
      montoTotal,
      montoPendiente,
    }
  })

  // Datos de chart: últimos 6 meses
  const ticketsPorMes = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const mes = d.toLocaleDateString("es-VE", { month: "short", year: "2-digit" })
    const base_servicios = [3, 5, 4, 7, 6, demoTickets.filter((t) => t.tipo === "servicio").length][i] ?? 2
    const base_proyectos = [1, 2, 1, 3, 2, demoTickets.filter((t) => t.tipo === "proyecto").length][i] ?? 1
    return {
      mes,
      servicios: base_servicios,
      proyectos: base_proyectos,
      finalizados: Math.floor(base_servicios * 0.7 + base_proyectos * 0.5),
    }
  })

  // Activity feed desde los tickets del sistema
  const changeTypes: ChangeType[] = ["creacion", "cambio_estado", "asignacion", "finalizacion"]
  const actividadReciente: ActivityFeedItem[] = demoTickets
    .slice(0, 5)
    .map((ticket, i) => ({
      id: `activity-${ticket.id}`,
      tipo: changeTypes[i % changeTypes.length] as ChangeType,
      descripcion: `Ticket ${ticket.numero_ticket} — ${ticket.asunto}`,
      usuario: ticket.creador?.nombre ?? "Sistema",
      fecha: ticket.updated_at,
      ticket_numero: ticket.numero_ticket,
    }))

  return {
    ...base,
    ingresoTotal,
    ingresoPendiente,
    ingresoEsteMes,
    technicianKPIs,
    ticketsPorMes,
    actividadReciente,
  }
}

export interface DemoPaymentView {
  id: string
  monto_a_pagar: number
  estado_pago: string
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  ticket: { numero_ticket: string; asunto: string }
  tecnico: { nombre: string; apellido: string }
}

export function getDemoPaymentsView(): {
  pending: DemoPaymentView[]
  completed: DemoPaymentView[]
} {
  const paymentList: DemoPaymentView[] = demoPayments.map((payment) => {
    const ticket = demoTickets.find((item) => item.id === payment.ticket_id)
    const tecnico = findUser(payment.tecnico_id)

    return {
      id: payment.id,
      monto_a_pagar: Number(payment.monto_a_pagar),
      estado_pago: payment.estado_pago,
      fecha_habilitacion: payment.fecha_habilitacion,
      fecha_pago: payment.fecha_pago,
      metodo_pago: payment.metodo_pago,
      ticket: {
        numero_ticket: ticket?.numero_ticket ?? "N/A",
        asunto: ticket?.asunto ?? "Sin asunto",
      },
      tecnico: {
        nombre: tecnico?.nombre ?? "Tecnico",
        apellido: tecnico?.apellido ?? "Demo",
      },
    }
  })

  const sorted = paymentList.sort(
    (a, b) =>
      new Date(b.fecha_habilitacion).getTime() - new Date(a.fecha_habilitacion).getTime()
  )

  return {
    pending: deepClone(sorted.filter((payment) => payment.estado_pago === "pendiente")),
    completed: deepClone(sorted.filter((payment) => payment.estado_pago === "pagado")),
  }
}

export function processPaymentDemo(
  paymentId: string,
  input: { metodo_pago: string; referencia_pago?: string; observaciones?: string },
  currentUser: User
): TechnicianPayment | null {
  const index = demoPayments.findIndex((p) => p.id === paymentId)
  if (index < 0) return null
  const updated: TechnicianPayment = {
    ...demoPayments[index]!,
    estado_pago: "pagado",
    fecha_pago: new Date().toISOString(),
    metodo_pago: input.metodo_pago as PaymentMethod,
    referencia_pago: input.referencia_pago || null,
    pagado_por: currentUser.id,
    observaciones: input.observaciones || null,
    updated_at: new Date().toISOString(),
  }
  demoPayments[index] = updated
  return deepClone(updated)
}

// ─── Sistema de Configuración Demo ────────────────────────────────────────────

let demoConfig: SystemConfig[] = [
  { id: 1, clave: "empresa_nombre", valor: "COPS Electronics", descripcion: "Nombre de la empresa", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 2, clave: "empresa_rif", valor: "J-12345678-9", descripcion: "RIF fiscal de la empresa", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 3, clave: "empresa_telefono", valor: "+58 212 000 0000", descripcion: "Teléfono de contacto principal", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 4, clave: "empresa_email", valor: "ops@copselectronics.com", descripcion: "Email operacional", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 5, clave: "empresa_direccion", valor: "Caracas, Venezuela", descripcion: "Dirección fiscal", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 6, clave: "logo_url", valor: "", descripcion: "URL del logo de la empresa (vacío = default)", tipo_dato: "string", updated_at: new Date().toISOString() },
  { id: 7, clave: "ticket_tiempo_respuesta_horas", valor: "24", descripcion: "SLA: tiempo máximo de respuesta (horas)", tipo_dato: "number", updated_at: new Date().toISOString() },
  { id: 8, clave: "ticket_tiempo_resolucion_horas", valor: "72", descripcion: "SLA: tiempo máximo de resolución (horas)", tipo_dato: "number", updated_at: new Date().toISOString() },
  { id: 9, clave: "ticket_monto_servicio_default", valor: "40", descripcion: "Monto por defecto para nuevos servicios (USD)", tipo_dato: "number", updated_at: new Date().toISOString() },
  { id: 10, clave: "comision_porcentaje_default", valor: "50", descripcion: "Porcentaje de comisión para técnicos", tipo_dato: "number", updated_at: new Date().toISOString() },
  { id: 11, clave: "inspeccion_requerida", valor: "false", descripcion: "Requerir inspección antes de finalizar ticket", tipo_dato: "boolean", updated_at: new Date().toISOString() },
  { id: 12, clave: "notif_email_nuevo_ticket", valor: "true", descripcion: "Notificar por email al crear ticket", tipo_dato: "boolean", updated_at: new Date().toISOString() },
  { id: 13, clave: "notif_email_cambio_estado", valor: "true", descripcion: "Notificar cambios de estado por email", tipo_dato: "boolean", updated_at: new Date().toISOString() },
  { id: 14, clave: "notif_slack_webhook", valor: "", descripcion: "Webhook de Slack (vacío = desactivado)", tipo_dato: "string", updated_at: new Date().toISOString() },
]

export function getDemoConfig(): SystemConfig[] {
  return deepClone(demoConfig)
}

export function updateDemoConfig(clave: string, valor: string): SystemConfig | null {
  const idx = demoConfig.findIndex((c) => c.clave === clave)
  if (idx === -1) return null
  demoConfig[idx] = { ...demoConfig[idx]!, valor, updated_at: new Date().toISOString() }
  return deepClone(demoConfig[idx]!)
}
