import {
  DEFAULT_COMMISSION_PERCENTAGE,
  ROLE_HIERARCHY,
  VALID_TRANSITIONS,
  ADMIN_REVERSE_TRANSITIONS,
  generateTicketNumber,
} from "@/types"
import type {
  Agencia,
  AgenciaCreateInput,
  AgenciaUpdateInput,
  ActivityFeedItem,
  AssignVisitaInput,
  BitacoraVisita,
  BitacoraVisitaInput,
  ChangeType,
  Cliente,
  ClienteContacto,
  ClienteCreateInput,
  ClienteUpdateInput,
  DashboardStats,
  EnhancedDashboardStats,
  FaseEstado,
  Inspeccion,
  InspeccionCreateInput,
  MantenimientoReportes,
  PaginatedResponse,
  PaymentMethod,
  Region,
  RutinaCreateInput,
  RutinaEstado,
  RutinaMantenimiento,
  SesionTrabajo,
  SystemConfig,
  TechnicianKPI,
  TechnicianPayment,
  Ticket,
  TicketCreateInput,
  TicketDocumento,
  TicketFase,
  TicketFoto,
  TicketPriority,
  TicketStatus,
  TicketUpdateInput,
  TipoDocumento,
  TipoFoto,
  UpdateLog,
  User,
  UserRole,
  Viatico,
  ViaticoCreateInput,
  ViaticoEstado,
  VisitaEstado,
  VisitaEstadoUpdateInput,
  VisitaMantenimiento,
} from "@/types"

const now = Date.now()
const hour = 60 * 60 * 1000

const DEMO_USERS: User[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    nombre: "Admin",
    apellido: "Sistema",
    email: "operations@copselectronics.com",
    rol: "presidente",
    nivel_jerarquico: 5,
    telefono: "+58 414 000 0000",
    cedula: "V-00000000",
    estado: "activo",
    activo_desde: new Date(now - 72 * hour).toISOString(),
    foto_perfil_path: null,
    especialidad: null,
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
    activo_desde: new Date(now - 72 * hour).toISOString(),
    foto_perfil_path: null,
    especialidad: null,
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
    activo_desde: new Date(now - 72 * hour).toISOString(),
    foto_perfil_path: null,
    especialidad: "CCTV y alarmas",
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
    activo_desde: new Date(now - 72 * hour).toISOString(),
    foto_perfil_path: null,
    especialidad: "Control de acceso",
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
    numero_carta: partial.numero_carta ?? null,
    tipo_mantenimiento: partial.tipo_mantenimiento ?? null,
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
    facturacion_tipo: partial.facturacion_tipo ?? "fijo",
    tarifa_hora: partial.tarifa_hora ?? null,
    ticket_origen_id: partial.ticket_origen_id ?? null,
    ticket_derivado_id: partial.ticket_derivado_id ?? null,
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
  return []
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
    facturacion_tipo: ticket.facturacion_tipo ?? "fijo",
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

export function getDemoTickets(): Ticket[] {
  return deepClone(demoTickets)
}

export function getDemoPayments(): TechnicianPayment[] {
  return deepClone(demoPayments)
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
      borrador: byStatus("borrador"),
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

function getNextSequence(tipo: "servicio" | "proyecto" | "inspeccion"): number {
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
    estado: input.estado === "borrador" ? "borrador" : "asignado",
    fecha_asignacion: input.estado === "borrador" ? undefined : nowIso,
    monto_servicio: input.monto_servicio ?? (input.tipo === 'inspeccion' ? 20 : 40),
    ticket_origen_id: input.ticket_origen_id || null,
    ticket_derivado_id: null,
    created_at: nowIso,
    updated_at: nowIso,
  })

  demoTickets = [ticket, ...demoTickets]
  return deepClone(ticket)
}

export function createDemoConvertirInspeccion(
  ticketId: string,
  tipo: "servicio" | "proyecto",
  currentUser: User
): { ticket: Ticket; nuevoTicket: Ticket } | null {
  const inspeccion = demoTickets.find((t) => t.id === ticketId)
  if (!inspeccion || inspeccion.tipo !== "inspeccion") return null

  const nowIso = new Date().toISOString()
  const nuevoId = crypto.randomUUID()
  const nuevoNumero = generateTicketNumber(tipo, getNextSequence(tipo))

  const nuevoTicket = buildTicket({
    id: nuevoId,
    numero_ticket: nuevoNumero,
    tipo,
    cliente_nombre: inspeccion.cliente_nombre,
    cliente_empresa: inspeccion.cliente_empresa,
    cliente_email: inspeccion.cliente_email,
    cliente_telefono: inspeccion.cliente_telefono,
    cliente_direccion: inspeccion.cliente_direccion,
    prioridad: inspeccion.prioridad,
    origen: inspeccion.origen,
    tecnico_id: inspeccion.tecnico_id,
    asunto: tipo === "servicio"
      ? `Servicio derivado de inspección ${inspeccion.numero_ticket}`
      : `Proyecto derivado de inspección ${inspeccion.numero_ticket}`,
    descripcion: inspeccion.descripcion,
    requerimientos: inspeccion.requerimientos,
    monto_servicio: tipo === "servicio" ? 40 : 0,
    ticket_origen_id: ticketId,
    ticket_derivado_id: null,
    creado_por: currentUser.id,
    creador: currentUser,
    estado: "asignado",
    fecha_asignacion: nowIso,
    created_at: nowIso,
    updated_at: nowIso,
  })

  // Update inspection ticket with derivado reference
  demoTickets = demoTickets.map((t) =>
    t.id === ticketId
      ? { ...t, ticket_derivado_id: nuevoId, updated_at: nowIso }
      : t
  )

  demoTickets = [nuevoTicket, ...demoTickets]

  return {
    ticket: deepClone(demoTickets.find((t) => t.id === ticketId)!),
    nuevoTicket: deepClone(nuevoTicket),
  }
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
    monto_servicio_final?: number
  },
  userRole?: UserRole
): { ticket?: Ticket; error?: string } {
  const index = demoTickets.findIndex((ticket) => ticket.id === id)
  if (index < 0) {
    return { error: "Ticket no encontrado" }
  }

  const current = demoTickets[index]
  const isAdmin = userRole ? ROLE_HIERARCHY[userRole] >= 3 : false
  const forwardOk = VALID_TRANSITIONS[current.estado].includes(newStatus)
  const reverseOk = isAdmin && ADMIN_REVERSE_TRANSITIONS[current.estado].includes(newStatus)
  if (!forwardOk && !reverseOk) {
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
  if (additionalData?.monto_servicio_final !== undefined) {
    updateData.monto_servicio = additionalData.monto_servicio_final
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

let demoFases: TicketFase[] = []

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

let demoFotos: TicketFoto[] = []

export function getDemoFotosByTicket(ticketId: string, tipoFoto?: TipoFoto): TicketFoto[] {
  let fotos = demoFotos.filter((f) => f.ticket_id === ticketId)
  if (tipoFoto) fotos = fotos.filter((f) => f.tipo_foto === tipoFoto)
  return deepClone(fotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
}

export function getDemoFotoById(id: string): TicketFoto | null {
  const foto = demoFotos.find((item) => item.id === id)
  return foto ? deepClone(foto) : null
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

export function updateDemoFoto(
  id: string,
  updates: { descripcion?: string; tipo_foto?: TipoFoto },
  userId: string,
  userLevel: number
): TicketFoto | null {
  const foto = demoFotos.find((f) => f.id === id)
  if (!foto) return null
  if (foto.subido_por !== userId && userLevel < 3) return null

  const updated: TicketFoto = {
    ...foto,
    ...updates,
    descripcion:
      updates.descripcion !== undefined ? updates.descripcion || null : foto.descripcion,
  }

  demoFotos = demoFotos.map((item) => (item.id === id ? updated : item))
  return deepClone(updated)
}

// ─── Documentos de Ticket ─────────────────────────────────────────────────────

let demoDocumentos: TicketDocumento[] = []

export function getDemoDocumentosByTicket(ticketId: string): TicketDocumento[] {
  return deepClone(
    demoDocumentos
      .filter((d) => d.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  )
}

export function getDemoDocumentoById(id: string): TicketDocumento | null {
  const doc = demoDocumentos.find((d) => d.id === id)
  return doc ? deepClone(doc) : null
}

export function createDemoDocumento(
  ticketId: string,
  input: { nombre_archivo: string; tipo_documento: TipoDocumento; descripcion?: string; tamanio_bytes?: number; mime_type?: string },
  currentUser: User
): TicketDocumento {
  const doc: TicketDocumento = {
    id: crypto.randomUUID(),
    ticket_id: ticketId,
    subido_por: currentUser.id,
    storage_path: `documentos/${ticketId}/${input.nombre_archivo}`,
    nombre_archivo: input.nombre_archivo,
    tipo_documento: input.tipo_documento,
    descripcion: input.descripcion || null,
    tamanio_bytes: input.tamanio_bytes ?? null,
    mime_type: input.mime_type ?? null,
    created_at: new Date().toISOString(),
    subidor: currentUser,
    url: null,
  }
  demoDocumentos = [doc, ...demoDocumentos]
  return deepClone(doc)
}

export function deleteDemoDocumento(id: string, userId: string, userLevel: number): boolean {
  const doc = demoDocumentos.find((d) => d.id === id)
  if (!doc) return false
  if (doc.subido_por !== userId && userLevel < 3) return false
  demoDocumentos = demoDocumentos.filter((d) => d.id !== id)
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

// ─── Update Logs (Timeline de actualizaciones) ────────────────────────────────

let demoUpdateLogs: UpdateLog[] = []

export function getDemoUpdateLogs(ticketId: string): UpdateLog[] {
  return deepClone(
    demoUpdateLogs
      .filter((l) => l.ticket_id === ticketId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  )
}

export function addDemoUpdateLog(
  log: Omit<UpdateLog, 'id' | 'created_at'>
): UpdateLog {
  const entry: UpdateLog = {
    ...log,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  }
  demoUpdateLogs.unshift(entry)
  return deepClone(entry)
}

// ─── Clientes DB (Sprint 7) ───────────────────────────────────────────────────

let demoClientes: Cliente[] = []

export function getDemoClientes(
  options: { page?: number; pageSize?: number; search?: string; estado?: string } = {}
): PaginatedResponse<Cliente> {
  const page = options.page || 1
  const pageSize = options.pageSize || 20
  let filtered = [...demoClientes]

  if (options.search) {
    const q = options.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.nombre.toLowerCase().includes(q) ||
        (c.empresa && c.empresa.toLowerCase().includes(q)) ||
        (c.rif_cedula && c.rif_cedula.toLowerCase().includes(q)) ||
        c.telefono.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    )
  }

  if (options.estado) {
    filtered = filtered.filter((c) => c.estado === options.estado)
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return { data: deepClone(data), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export function getDemoClienteById(id: string): Cliente | null {
  const c = demoClientes.find((c) => c.id === id)
  return c ? deepClone(c) : null
}

export function createDemoCliente(input: ClienteCreateInput): Cliente {
  const now = new Date().toISOString()
  const cliente: Cliente = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    apellido: input.apellido || null,
    empresa: input.empresa || null,
    email: input.email || null,
    telefono: input.telefono,
    direccion: input.direccion,
    rif_cedula: input.rif_cedula || null,
    estado: "activo",
    observaciones: input.observaciones || null,
    contactos: input.contactos ? input.contactos.map((ct) => ({ ...ct, id: crypto.randomUUID() })) : [],
    created_at: now,
    updated_at: now,
    tickets_count: 0,
    ultimo_ticket_fecha: null,
  }
  demoClientes = [cliente, ...demoClientes]
  return deepClone(cliente)
}

export function updateDemoCliente(id: string, input: ClienteUpdateInput): Cliente | null {
  const idx = demoClientes.findIndex((c) => c.id === id)
  if (idx === -1) return null
  const updated: Cliente = {
    ...demoClientes[idx]!,
    ...input,
    apellido: input.apellido !== undefined ? (input.apellido || null) : demoClientes[idx]!.apellido,
    empresa: input.empresa !== undefined ? (input.empresa || null) : demoClientes[idx]!.empresa,
    email: input.email !== undefined ? (input.email || null) : demoClientes[idx]!.email,
    rif_cedula: input.rif_cedula !== undefined ? (input.rif_cedula || null) : demoClientes[idx]!.rif_cedula,
    observaciones: input.observaciones !== undefined ? (input.observaciones || null) : demoClientes[idx]!.observaciones,
    contactos:
      input.contactos !== undefined
        ? input.contactos.map((ct) => ({
            ...ct,
            id: (ct as Partial<ClienteContacto>).id ?? crypto.randomUUID(),
          }))
        : demoClientes[idx]!.contactos,
    updated_at: new Date().toISOString(),
  }
  demoClientes[idx] = updated
  return deepClone(updated)
}

export function deleteDemoCliente(id: string): boolean {
  const idx = demoClientes.findIndex((c) => c.id === id)
  if (idx === -1) return false
  demoClientes = demoClientes.filter((c) => c.id !== id)
  return true
}

export function searchDemoClientes(query: string): Cliente[] {
  const q = query.toLowerCase()
  return deepClone(
    demoClientes
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(q) ||
          (c.empresa && c.empresa.toLowerCase().includes(q)) ||
          c.telefono.includes(q)
      )
      .slice(0, 10)
  )
}

// ─── Mantenimiento DB (Sprint 8) ───────────────────────────────────────────────

const DEFAULT_EQUIPOS_OBJETIVO = [
  "CCTV / DVRs",
  "Sistemas de Alarma",
  "Bóvedas y Esclusas",
  "Cercos Eléctricos",
]

let demoAgencias: Agencia[] = []

let demoRutinasMantenimiento: RutinaMantenimiento[] = []

let demoVisitasMantenimiento: VisitaMantenimiento[] = []

let demoBitacorasVisita: BitacoraVisita[] = []

let demoViaticos: Viatico[] = []

function enrichRutina(rutina: RutinaMantenimiento): RutinaMantenimiento {
  return {
    ...rutina,
    creador: rutina.creado_por ? findUser(rutina.creado_por) : undefined,
  }
}

function enrichVisita(visita: VisitaMantenimiento): VisitaMantenimiento {
  return {
    ...visita,
    agencia: demoAgencias.find((agencia) => agencia.id === visita.agencia_id),
    tecnico: visita.tecnico_id ? findUser(visita.tecnico_id) : undefined,
    rutina: demoRutinasMantenimiento.find((rutina) => rutina.id === visita.rutina_id),
  }
}

function enrichViatico(viatico: Viatico): Viatico {
  const visita = viatico.visita_id
    ? demoVisitasMantenimiento.find((item) => item.id === viatico.visita_id)
    : undefined

  return {
    ...viatico,
    visita: visita ? enrichVisita(visita) : undefined,
    tecnico: findUser(viatico.tecnico_id),
    aprobador: viatico.aprobado_por ? findUser(viatico.aprobado_por) : undefined,
  }
}

function nextAgenciaId(): number {
  return demoAgencias.reduce((max, agencia) => Math.max(max, agencia.id), 0) + 1
}

export function getDemoAgencias(search = ""): Agencia[] {
  const q = search.trim().toLowerCase()
  const filtered = q
    ? demoAgencias.filter((agencia) =>
        `${agencia.nombre} ${agencia.ciudad} ${agencia.region}`.toLowerCase().includes(q)
      )
    : demoAgencias

  return deepClone(filtered.sort((a, b) => a.nombre.localeCompare(b.nombre)))
}

export function createDemoAgencia(input: AgenciaCreateInput): Agencia {
  const nowIso = new Date().toISOString()
  const agencia: Agencia = {
    id: nextAgenciaId(),
    nombre: input.nombre,
    region: input.region,
    ciudad: input.ciudad,
    direccion: input.direccion || null,
    contacto: input.contacto || null,
    estado_operativo: input.estado_operativo || "activa",
    created_at: nowIso,
    updated_at: nowIso,
  }
  demoAgencias = [agencia, ...demoAgencias]
  return deepClone(agencia)
}

export function updateDemoAgencia(id: number, input: AgenciaUpdateInput): Agencia | null {
  const index = demoAgencias.findIndex((agencia) => agencia.id === id)
  if (index === -1) return null
  demoAgencias[index] = {
    ...demoAgencias[index]!,
    ...input,
    direccion: input.direccion !== undefined ? input.direccion || null : demoAgencias[index]!.direccion,
    contacto: input.contacto !== undefined ? input.contacto || null : demoAgencias[index]!.contacto,
    updated_at: new Date().toISOString(),
  }
  return deepClone(demoAgencias[index]!)
}

export function deleteDemoAgencia(id: number): boolean {
  if (demoVisitasMantenimiento.some((visita) => visita.agencia_id === id)) return false
  const initial = demoAgencias.length
  demoAgencias = demoAgencias.filter((agencia) => agencia.id !== id)
  return demoAgencias.length < initial
}

export function getDemoRutinas(): RutinaMantenimiento[] {
  return deepClone(
    demoRutinasMantenimiento
      .map((rutina) => enrichRutina(rutina))
      .sort((a, b) => {
        if (b.anio !== a.anio) return b.anio - a.anio
        return b.trimestre - a.trimestre
      })
  )
}

export function createDemoRutinaConVisitas(input: RutinaCreateInput, currentUser: User): { rutina: RutinaMantenimiento; visitas: VisitaMantenimiento[] } {
  const nowIso = new Date().toISOString()
  const selectedAgencias = (input.agencia_ids && input.agencia_ids.length > 0
    ? demoAgencias.filter((agencia) => input.agencia_ids!.includes(agencia.id))
    : demoAgencias.filter((agencia) => input.regiones.includes(agencia.region))
  ).filter((agencia) => agencia.estado_operativo !== "inactiva")

  const rutina: RutinaMantenimiento = {
    id: crypto.randomUUID(),
    titulo: input.titulo,
    trimestre: input.trimestre,
    anio: input.anio,
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin,
    regiones: input.regiones,
    equipos_objetivo: input.equipos_objetivo,
    presupuesto_viaticos: input.presupuesto_viaticos ?? null,
    creado_por: currentUser.id,
    estado: input.estado || "programada",
    created_at: nowIso,
    updated_at: nowIso,
    creador: currentUser,
  }

  const visitas = selectedAgencias.map<VisitaMantenimiento>((agencia) => ({
    id: crypto.randomUUID(),
    rutina_id: rutina.id,
    agencia_id: agencia.id,
    tecnico_id: null,
    fecha_programada: null,
    fecha_realizada: null,
    estado: "pendiente",
    equipos_asignados: input.equipos_objetivo,
    observaciones_programacion: null,
    created_at: nowIso,
    updated_at: nowIso,
  }))

  demoRutinasMantenimiento = [rutina, ...demoRutinasMantenimiento]
  demoVisitasMantenimiento = [...visitas, ...demoVisitasMantenimiento]

  return {
    rutina: deepClone(enrichRutina(rutina)),
    visitas: deepClone(visitas.map((visita) => enrichVisita(visita))),
  }
}

export function updateDemoRutinaEstado(id: string, estado: RutinaEstado): RutinaMantenimiento | null {
  const index = demoRutinasMantenimiento.findIndex((rutina) => rutina.id === id)
  if (index === -1) return null
  demoRutinasMantenimiento[index] = {
    ...demoRutinasMantenimiento[index]!,
    estado,
    updated_at: new Date().toISOString(),
  }
  return deepClone(enrichRutina(demoRutinasMantenimiento[index]!))
}

export function getDemoRutinaDetalle(id: string): {
  rutina: RutinaMantenimiento
  visitas: VisitaMantenimiento[]
  resumen: { total: number; completadas: number; pendientes: number; asignadas: number }
} | null {
  const rutina = demoRutinasMantenimiento.find((item) => item.id === id)
  if (!rutina) return null
  const visitas = demoVisitasMantenimiento.filter((visita) => visita.rutina_id === id).map((visita) => enrichVisita(visita))
  return {
    rutina: deepClone(enrichRutina(rutina)),
    visitas: deepClone(visitas),
    resumen: {
      total: visitas.length,
      completadas: visitas.filter((visita) => visita.estado === "completada").length,
      pendientes: visitas.filter((visita) => visita.estado === "pendiente").length,
      asignadas: visitas.filter((visita) => visita.tecnico_id && visita.fecha_programada).length,
    },
  }
}

export function getDemoVisitasMantenimiento(filters: {
  rutinaId?: string
  region?: Region
  tecnicoId?: string
  estado?: VisitaEstado
} = {}): VisitaMantenimiento[] {
  let filtered = demoVisitasMantenimiento
  if (filters.rutinaId) filtered = filtered.filter((visita) => visita.rutina_id === filters.rutinaId)
  if (filters.tecnicoId) filtered = filtered.filter((visita) => visita.tecnico_id === filters.tecnicoId)
  if (filters.estado) filtered = filtered.filter((visita) => visita.estado === filters.estado)
  if (filters.region) {
    filtered = filtered.filter((visita) => demoAgencias.find((agencia) => agencia.id === visita.agencia_id)?.region === filters.region)
  }

  return deepClone(
    filtered
      .map((visita) => enrichVisita(visita))
      .sort((a, b) => {
        const left = a.fecha_programada ? new Date(a.fecha_programada).getTime() : Number.MAX_SAFE_INTEGER
        const right = b.fecha_programada ? new Date(b.fecha_programada).getTime() : Number.MAX_SAFE_INTEGER
        return left - right
      })
  )
}

export function assignDemoVisita(input: AssignVisitaInput): VisitaMantenimiento[] {
  const updatedAt = new Date().toISOString()
  const updated: VisitaMantenimiento[] = []

  demoVisitasMantenimiento = demoVisitasMantenimiento.map((visita) => {
    if (!input.visita_ids.includes(visita.id)) return visita
    const next: VisitaMantenimiento = {
      ...visita,
      tecnico_id: input.tecnico_id,
      fecha_programada: input.fecha_programada,
      observaciones_programacion: input.observaciones_programacion || null,
      updated_at: updatedAt,
    }
    updated.push(next)
    return next
  })

  return deepClone(updated.map((visita) => enrichVisita(visita)))
}

export function getDemoMisVisitas(userId: string): VisitaMantenimiento[] {
  return getDemoVisitasMantenimiento({ tecnicoId: userId })
}

export function updateDemoVisitaEstado(visitaId: string, input: VisitaEstadoUpdateInput): VisitaMantenimiento | null {
  const index = demoVisitasMantenimiento.findIndex((visita) => visita.id === visitaId)
  if (index === -1) return null
  const next: VisitaMantenimiento = {
    ...demoVisitasMantenimiento[index]!,
    estado: input.estado,
    fecha_realizada: input.estado === "completada" ? new Date().toISOString() : demoVisitasMantenimiento[index]!.fecha_realizada,
    updated_at: new Date().toISOString(),
  }
  demoVisitasMantenimiento[index] = next
  return deepClone(enrichVisita(next))
}

export function getDemoBitacoraByVisita(visitaId: string): BitacoraVisita | null {
  const bitacora = demoBitacorasVisita.find((item) => item.visita_id === visitaId)
  return bitacora ? deepClone(bitacora) : null
}

export function saveDemoBitacoraVisita(input: BitacoraVisitaInput, currentUser: User): BitacoraVisita {
  const index = demoBitacorasVisita.findIndex((item) => item.visita_id === input.visita_id)
  const nowIso = new Date().toISOString()

  if (index >= 0) {
    demoBitacorasVisita[index] = {
      ...demoBitacorasVisita[index]!,
      log: input.log,
      checklist: input.checklist,
      fotos: input.fotos || [],
      repuestos_usados: input.repuestos_usados || [],
      repuestos_devueltos: input.repuestos_devueltos || [],
      repuestos_pendientes: input.repuestos_pendientes || [],
      updated_at: nowIso,
      creador: currentUser,
    }
    return deepClone(demoBitacorasVisita[index]!)
  }

  const bitacora: BitacoraVisita = {
    id: crypto.randomUUID(),
    visita_id: input.visita_id,
    log: input.log,
    checklist: input.checklist,
    fotos: input.fotos || [],
    repuestos_usados: input.repuestos_usados || [],
    repuestos_devueltos: input.repuestos_devueltos || [],
    repuestos_pendientes: input.repuestos_pendientes || [],
    creado_por: currentUser.id,
    created_at: nowIso,
    updated_at: nowIso,
    creador: currentUser,
  }
  demoBitacorasVisita = [bitacora, ...demoBitacorasVisita]
  return deepClone(bitacora)
}

export function getDemoViaticos(user: User): Viatico[] {
  const visible = ROLE_HIERARCHY[user.rol] >= 2
    ? demoViaticos
    : demoViaticos.filter((viatico) => viatico.tecnico_id === user.id)
  return deepClone(visible.map((viatico) => enrichViatico(viatico)).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
}

export function createDemoViatico(input: ViaticoCreateInput, currentUser: User): Viatico | null {
  const visita = input.visita_id
    ? demoVisitasMantenimiento.find((item) => item.id === input.visita_id)
    : undefined
  const tecnicoId = visita?.tecnico_id || input.tecnico_id || currentUser.id
  if (!tecnicoId) return null

  const viatico: Viatico = {
    id: crypto.randomUUID(),
    visita_id: input.visita_id || null,
    tecnico_id: tecnicoId,
    rutina_id: visita?.rutina_id || input.rutina_id || null,
    ruta: input.ruta,
    monto: input.monto,
    detalle: input.detalle || null,
    observaciones: input.observaciones || null,
    estado: "enviado",
    fecha_envio: new Date().toISOString(),
    fecha_aprobacion: null,
    aprobado_por: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  demoViaticos = [viatico, ...demoViaticos]
  return deepClone(enrichViatico(viatico))
}

export function updateDemoViaticoEstado(id: string, estado: ViaticoEstado, approver?: User): Viatico | null {
  const index = demoViaticos.findIndex((viatico) => viatico.id === id)
  if (index === -1) return null
  demoViaticos[index] = {
    ...demoViaticos[index]!,
    estado,
    fecha_aprobacion: estado === "aprobado" || estado === "rechazado" ? new Date().toISOString() : demoViaticos[index]!.fecha_aprobacion,
    aprobado_por: approver?.id || demoViaticos[index]!.aprobado_por,
    updated_at: new Date().toISOString(),
  }
  return deepClone(enrichViatico(demoViaticos[index]!))
}

export function getDemoMantenimientoReportes(): MantenimientoReportes {
  const visitas = demoVisitasMantenimiento.map((visita) => enrichVisita(visita))
  const bitacoras = demoBitacorasVisita
  const viaticos = demoViaticos

  const agenciasAtendidas = new Set(visitas.filter((visita) => visita.estado === "completada").map((visita) => visita.agencia_id)).size
  const viaticosAprobadosMonto = viaticos.filter((viatico) => viatico.estado === "aprobado").reduce((sum, viatico) => sum + viatico.monto, 0)
  const viaticosPendientesMonto = viaticos.filter((viatico) => viatico.estado === "enviado" || viatico.estado === "planeado").reduce((sum, viatico) => sum + viatico.monto, 0)

  return {
    resumen: {
      total_rutinas: demoRutinasMantenimiento.length,
      total_visitas: visitas.length,
      visitas_completadas: visitas.filter((visita) => visita.estado === "completada").length,
      visitas_pendientes: visitas.filter((visita) => visita.estado !== "completada" && visita.estado !== "cancelada").length,
      agencias_atendidas: agenciasAtendidas,
      viaticos_aprobados_monto: viaticosAprobadosMonto,
      viaticos_pendientes_monto: viaticosPendientesMonto,
    },
    progreso_por_rutina: demoRutinasMantenimiento.map((rutina) => {
      const items = visitas.filter((visita) => visita.rutina_id === rutina.id)
      const completadas = items.filter((visita) => visita.estado === "completada").length
      const pendientes = items.filter((visita) => visita.estado !== "completada" && visita.estado !== "cancelada").length
      return {
        rutina_id: rutina.id,
        titulo: rutina.titulo,
        estado: rutina.estado,
        total_visitas: items.length,
        completadas,
        pendientes,
        porcentaje_avance: items.length > 0 ? Math.round((completadas / items.length) * 100) : 0,
      }
    }),
    visitas_por_tecnico: DEMO_USERS.filter((user) => user.rol === "tecnico").map((tecnico) => {
      const items = visitas.filter((visita) => visita.tecnico_id === tecnico.id)
      return {
        tecnico_id: tecnico.id,
        tecnico_nombre: `${tecnico.nombre} ${tecnico.apellido}`,
        total: items.length,
        completadas: items.filter((visita) => visita.estado === "completada").length,
        en_proceso: items.filter((visita) => visita.estado === "en_proceso").length,
      }
    }),
    viaticos_por_rutina: demoRutinasMantenimiento.map((rutina) => {
      const items = viaticos.filter((viatico) => viatico.rutina_id === rutina.id)
      return {
        rutina_id: rutina.id,
        titulo: rutina.titulo,
        presupuesto: rutina.presupuesto_viaticos || 0,
        aprobado: items.filter((viatico) => viatico.estado === "aprobado").reduce((sum, viatico) => sum + viatico.monto, 0),
        pendiente: items.filter((viatico) => viatico.estado === "enviado" || viatico.estado === "planeado").reduce((sum, viatico) => sum + viatico.monto, 0),
      }
    }),
    ultimas_bitacoras: bitacoras
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((bitacora) => {
        const visita = visitas.find((item) => item.id === bitacora.visita_id)
        const tecnico = bitacora.creado_por ? findUser(bitacora.creado_por) : undefined
        return {
          bitacora_id: bitacora.id,
          visita_id: bitacora.visita_id,
          agencia_nombre: visita?.agencia?.nombre || "Agencia",
          tecnico_nombre: tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : "Sin técnico",
          created_at: bitacora.created_at,
          log: bitacora.log,
        }
      }),
  }
}
