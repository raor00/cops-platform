// ═══════════════════════════════════════════════════════════════════════════
// TIPOS DEL SISTEMA DE GESTIÓN DE TICKETS - COPS ELECTRONICS
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS - Estados y Roles del Sistema
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'tecnico' | 'coordinador' | 'gerente' | 'vicepresidente' | 'presidente'

export type UserStatus = 'activo' | 'inactivo'

export type TicketType = 'servicio' | 'proyecto' | 'inspeccion'

export type TicketStatus = 'borrador' | 'asignado' | 'iniciado' | 'en_progreso' | 'finalizado' | 'cancelado'

export type TicketPriority = 'baja' | 'media' | 'alta' | 'urgente'

export type TicketOrigin = 'email' | 'telefono' | 'carta_aceptacion'

export type PaymentStatus = 'pendiente' | 'pagado'

export type PaymentMethod = 'pago_movil' | 'transferencia' | 'efectivo' | 'deposito' | 'cheque'

export type ChangeType = 'creacion' | 'asignacion' | 'cambio_estado' | 'modificacion' | 'finalizacion' | 'foto_subida' | 'inspeccion' | 'sesion_trabajo' | 'bloqueador'

export type FaseEstado = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada'

export type TipoFoto = 'progreso' | 'inspeccion' | 'documento' | 'antes' | 'despues'

export type InspeccionEstado = 'borrador' | 'completada' | 'reportada'

export type TipoBloqueador = 'material' | 'acceso' | 'tecnico' | 'otro'

// ─────────────────────────────────────────────────────────────────────────────
// JERARQUÍA DE ROLES - Sistema RBAC
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  tecnico: 1,
  coordinador: 2,
  gerente: 3,
  vicepresidente: 4,
  presidente: 5,
} as const

export const ROLE_LABELS: Record<UserRole, string> = {
  tecnico: 'Técnico',
  coordinador: 'Coordinador de Servicios',
  gerente: 'Gerente',
  vicepresidente: 'Vicepresidente',
  presidente: 'Presidente',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// TRANSICIONES DE ESTADO - Máquina de Estados
// ─────────────────────────────────────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  borrador: ['asignado', 'cancelado'],
  asignado: ['iniciado', 'cancelado'],
  iniciado: ['en_progreso', 'cancelado'],
  en_progreso: ['finalizado', 'cancelado'],
  finalizado: [],
  cancelado: [],
} as const

// Transiciones inversas — solo para gerente+ (ROLE_HIERARCHY >= 3)
export const ADMIN_REVERSE_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  borrador: [],
  asignado: [],
  iniciado: ['asignado'],
  en_progreso: ['iniciado'],
  finalizado: ['en_progreso'],
  cancelado: ['asignado'],
} as const

export const STATUS_LABELS: Record<TicketStatus, string> = {
  borrador: 'Borrador',
  asignado: 'Asignado',
  iniciado: 'Iniciado',
  en_progreso: 'En Progreso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
} as const

export const STATUS_COLORS: Record<TicketStatus, string> = {
  borrador: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  asignado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  iniciado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  en_progreso: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  finalizado: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
} as const

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
} as const

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
  baja: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  media: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  alta: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgente: 'bg-red-500/20 text-red-400 border-red-500/30',
} as const

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACES - Entidades del Sistema
// ─────────────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: UserRole
  nivel_jerarquico: number
  telefono: string | null
  cedula: string
  estado: UserStatus
  activo_desde: string | null
  foto_perfil_path: string | null
  especialidad: string | null
  created_at: string
  updated_at: string
}

export interface UserCreateInput {
  nombre: string
  apellido: string
  email: string
  password: string
  rol: UserRole
  telefono?: string
  cedula: string
}

export interface UserUpdateInput {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  estado?: UserStatus
  especialidad?: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string
  numero_ticket: string
  tipo: TicketType
  // Datos del cliente
  cliente_nombre: string
  cliente_empresa: string | null
  cliente_email: string | null
  cliente_telefono: string
  cliente_direccion: string
  // Descripción del trabajo
  asunto: string
  descripcion: string
  requerimientos: string
  materiales_planificados: MaterialItem[] | null
  prioridad: TicketPriority
  origen: TicketOrigin
  numero_carta: string | null
  tipo_mantenimiento: 'correctivo' | 'preventivo' | null
  carta_aceptacion_path: string | null
  // Asignación y estados
  creado_por: string
  tecnico_id: string | null
  estado: TicketStatus
  fecha_asignacion: string
  fecha_inicio: string | null
  fecha_finalizacion: string | null
  // Datos del técnico (al finalizar)
  materiales_usados: MaterialItem[] | null
  tiempo_trabajado: number | null
  observaciones_tecnico: string | null
  solucion_aplicada: string | null
  comprobante_path: string | null
  // Financiero
  monto_servicio: number
  facturacion_tipo: 'fijo' | 'por_hora' | null
  tarifa_hora: number | null
  // Correlación inspección ↔ servicio/proyecto
  ticket_origen_id: string | null
  ticket_derivado_id: string | null
  // Auditoría
  modificado_por: string | null
  fecha_ultima_modificacion: string | null
  created_at: string
  updated_at: string
  // Relaciones (opcionales, para joins)
  creador?: User
  tecnico?: User
  modificador?: User
}

export interface MaterialItem {
  id: string
  nombre: string
  cantidad: number
  unidad: string
  observacion?: string
}

export interface TicketCreateInput {
  tipo: TicketType
  cliente_nombre: string
  cliente_empresa?: string
  cliente_email?: string
  cliente_telefono: string
  cliente_direccion: string
  asunto: string
  descripcion: string
  requerimientos?: string
  materiales_planificados?: MaterialItem[]
  prioridad: TicketPriority
  origen: TicketOrigin
  numero_carta?: string
  tipo_mantenimiento?: 'correctivo' | 'preventivo'
  tecnico_id?: string
  monto_servicio?: number
  ticket_origen_id?: string
  estado?: Extract<TicketStatus, "borrador" | "asignado">
  facturacion_tipo?: "fijo" | "por_hora" | null
  tarifa_hora?: number | null
}

export interface TicketUpdateInput {
  cliente_nombre?: string
  cliente_empresa?: string
  cliente_email?: string
  cliente_telefono?: string
  cliente_direccion?: string
  asunto?: string
  descripcion?: string
  requerimientos?: string
  materiales_planificados?: MaterialItem[]
  prioridad?: TicketPriority
  tecnico_id?: string
  monto_servicio?: number
}

export interface TicketTechnicianInput {
  estado?: TicketStatus
  materiales_usados?: MaterialItem[]
  tiempo_trabajado?: number
  observaciones_tecnico?: string
  solucion_aplicada?: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface TechnicianPayment {
  id: string
  ticket_id: string
  tecnico_id: string
  monto_ticket: number
  porcentaje_comision: number
  monto_a_pagar: number
  facturacion_tipo: 'fijo' | 'por_hora' | null
  estado_pago: PaymentStatus
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: PaymentMethod | null
  referencia_pago: string | null
  pagado_por: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
  // Relaciones
  ticket?: Ticket
  tecnico?: User
  pagador?: User
}

export interface PaymentProcessInput {
  metodo_pago: PaymentMethod
  referencia_pago?: string
  observaciones?: string
}

// ─────────────────────────────────────────────────────────────────────────────

export interface ChangeHistory {
  id: string
  ticket_id: string
  usuario_id: string
  tipo_cambio: ChangeType
  campo_modificado: string | null
  valor_anterior: string | null
  valor_nuevo: string | null
  observacion: string | null
  ip_address: string | null
  created_at: string
  // Relaciones
  usuario?: User
  ticket?: Ticket
}

// ─────────────────────────────────────────────────────────────────────────────

export interface SystemConfig {
  id: number
  clave: string
  valor: string
  descripcion: string | null
  tipo_dato: 'string' | 'number' | 'boolean' | 'json'
  updated_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS DE RESPUESTA Y UTILIDADES
// ─────────────────────────────────────────────────────────────────────────────

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DashboardStats {
  ticketsTotal: number
  ticketsHoy: number
  ticketsPendientes: number
  ticketsFinalizados: number
  pagosPendientes: number
  montosPendientes: number
  ticketsPorEstado: Record<TicketStatus, number>
  ticketsPorPrioridad: Record<TicketPriority, number>
}

export interface TechnicianStats {
  ticketsAsignados: number
  ticketsCompletados: number
  ticketsEnProgreso: number
  pagosPendientes: number
  montoPendiente: number
  tiempoPromedioMinutos: number
}

// ─────────────────────────────────────────────────────────────────────────────
// PERMISOS - Matriz de Acceso
// ─────────────────────────────────────────────────────────────────────────────

export type Permission =
  | 'tickets:view_own'
  | 'tickets:view_all'
  | 'tickets:create'
  | 'tickets:edit'
  | 'tickets:delete'
  | 'tickets:change_status'
  | 'tickets:assign'
  | 'tickets:reassign'
  | 'users:view'
  | 'users:create'
  | 'users:edit'
  | 'users:delete'
  | 'payments:view'
  | 'payments:process'
  | 'reports:view'
  | 'reports:export'
  | 'config:view'
  | 'config:edit'
  | 'audit:view'
  | 'clients:view'
  | 'clients:create'
  | 'clients:edit'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  tecnico: [
    'tickets:view_own',
    'tickets:change_status',
  ],
  coordinador: [
    'tickets:view_own',
    'tickets:view_all',
    'tickets:create',
    'tickets:assign',
    'reports:view',
    'reports:export',
    'audit:view',
    'clients:view',
    'clients:create',
    'clients:edit',
  ],
  gerente: [
    'tickets:view_own',
    'tickets:view_all',
    'tickets:create',
    'tickets:edit',
    'tickets:delete',
    'tickets:change_status',
    'tickets:assign',
    'tickets:reassign',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'payments:view',
    'payments:process',
    'reports:view',
    'reports:export',
    'config:view',
    'audit:view',
    'clients:view',
    'clients:create',
    'clients:edit',
  ],
  vicepresidente: [
    'tickets:view_own',
    'tickets:view_all',
    'tickets:create',
    'tickets:edit',
    'tickets:delete',
    'tickets:change_status',
    'tickets:assign',
    'tickets:reassign',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'payments:view',
    'payments:process',
    'reports:view',
    'reports:export',
    'config:view',
    'config:edit',
    'audit:view',
    'clients:view',
    'clients:create',
    'clients:edit',
  ],
  presidente: [
    'tickets:view_own',
    'tickets:view_all',
    'tickets:create',
    'tickets:edit',
    'tickets:delete',
    'tickets:change_status',
    'tickets:assign',
    'tickets:reassign',
    'users:view',
    'users:create',
    'users:edit',
    'users:delete',
    'payments:view',
    'payments:process',
    'reports:view',
    'reports:export',
    'config:view',
    'config:edit',
    'audit:view',
    'clients:view',
    'clients:create',
    'clients:edit',
  ],
} as const

// ─────────────────────────────────────────────────────────────────────────────
// FUNCIONES DE UTILIDAD PARA PERMISOS
// ─────────────────────────────────────────────────────────────────────────────

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasMinimumLevel(role: UserRole, minimumLevel: number): boolean {
  return ROLE_HIERARCHY[role] >= minimumLevel
}

export function canEditTicket(role: UserRole): boolean {
  // Solo nivel 3 o superior puede editar tickets
  return hasMinimumLevel(role, 3)
}

export function canViewAllTickets(role: UserRole): boolean {
  // Coordinador o superior puede ver todos los tickets
  return hasMinimumLevel(role, 2)
}

export function canProcessPayments(role: UserRole): boolean {
  // Solo Gerente o superior puede procesar pagos
  return hasMinimumLevel(role, 3)
}

export function canManageUsers(role: UserRole): boolean {
  // Solo Gerente o superior puede gestionar usuarios
  return hasMinimumLevel(role, 3)
}

export function canChangeTicketStatus(
  role: UserRole,
  currentStatus: TicketStatus,
  newStatus: TicketStatus
): boolean {
  // Verificar que la transición sea válida
  const validTransitions = VALID_TRANSITIONS[currentStatus]
  if (!validTransitions.includes(newStatus)) {
    return false
  }

  // Técnico solo puede cambiar estado de sus propios tickets
  // Gerente+ puede cambiar cualquier estado
  return role === 'tecnico' || hasMinimumLevel(role, 3)
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILIDADES PARA NÚMEROS DE TICKET
// ─────────────────────────────────────────────────────────────────────────────

export function generateTicketNumber(type: TicketType, sequence: number): string {
  const prefix = type === 'servicio' ? 'TKT' : type === 'proyecto' ? 'PRY' : 'INS'
  const year = new Date().getFullYear()
  const paddedSequence = String(sequence).padStart(4, '0')
  return `${prefix}-${year}-${paddedSequence}`
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES DEL SISTEMA
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_SERVICE_AMOUNT = 40.00
export const DEFAULT_INSPECTION_AMOUNT = 20.00
export const DEFAULT_COMMISSION_PERCENTAGE = 50.00
export const DEFAULT_HOURLY_RATE = 10.00

// ─────────────────────────────────────────────────────────────────────────────
// NUEVAS INTERFACES v2 - Sistema de Gestión Avanzada
// ─────────────────────────────────────────────────────────────────────────────

// Extensión de User con campos de perfil
export interface UserProfile extends User {
  foto_perfil_path: string | null
  especialidad: string | null
  activo_desde: string | null
  foto_perfil_url?: string | null
}

// ─── Fases de Proyecto ───────────────────────────────────────────────────────

export interface TicketFase {
  id: string
  ticket_id: string
  nombre: string
  descripcion: string | null
  orden: number
  estado: FaseEstado
  progreso_porcentaje: number
  fecha_inicio_estimada: string | null
  fecha_fin_estimada: string | null
  fecha_inicio_real: string | null
  fecha_fin_real: string | null
  created_at: string
  updated_at: string
}

export interface FaseCreateInput {
  ticket_id: string
  nombre: string
  descripcion?: string
  orden?: number
  fecha_inicio_estimada?: string
  fecha_fin_estimada?: string
}

export interface FaseUpdateInput {
  nombre?: string
  descripcion?: string
  orden?: number
  estado?: FaseEstado
  progreso_porcentaje?: number
  fecha_inicio_estimada?: string
  fecha_fin_estimada?: string
  fecha_inicio_real?: string
  fecha_fin_real?: string
}

export const FASE_LABELS: Record<FaseEstado, string> = {
  pendiente: 'Pendiente',
  en_progreso: 'En Progreso',
  completada: 'Completada',
  cancelada: 'Cancelada',
} as const

export const FASE_COLORS: Record<FaseEstado, string> = {
  pendiente: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  en_progreso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completada: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelada: 'bg-red-500/20 text-red-400 border-red-500/30',
} as const

// ─── Sesiones de Trabajo ─────────────────────────────────────────────────────

export interface SesionTrabajo {
  id: string
  ticket_id: string
  tecnico_id: string
  fecha_inicio: string
  fecha_fin: string | null
  duracion_minutos: number | null
  notas: string | null
  estado_al_inicio: string | null
  created_at: string
  tecnico?: User
}

export interface SesionTrabajoCreateInput {
  ticket_id: string
  notas?: string
}

// ─── Fotos de Ticket ──────────────────────────────────────────────────────────

export interface TicketFoto {
  id: string
  ticket_id: string
  subido_por: string
  storage_path: string
  nombre_archivo: string
  tipo_foto: TipoFoto
  descripcion: string | null
  tamanio_bytes: number | null
  mime_type: string | null
  created_at: string
  subidor?: User
  url?: string
}

export const TIPO_FOTO_LABELS: Record<TipoFoto, string> = {
  progreso: 'Progreso',
  inspeccion: 'Inspección',
  documento: 'Documento',
  antes: 'Antes',
  despues: 'Después',
} as const

export const FOTO_UPLOAD_CONFIG = {
  maxSizeBytes: 10 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  maxFiles: 20,
} as const

// ─── Inspecciones ─────────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string
  categoria: string
  descripcion: string
  aplica: boolean
  estado: 'ok' | 'falla' | 'pendiente' | 'na'
  notas: string | null
  foto_ids: string[]
}

export interface Inspeccion {
  id: string
  ticket_id: string
  realizado_por: string
  fecha_inspeccion: string
  datos_checklist: ChecklistItem[]
  observaciones_generales: string | null
  recomendaciones: string | null
  materiales_requeridos: MaterialItem[]
  estado: InspeccionEstado
  created_at: string
  updated_at: string
  tecnico?: User
  fotos?: TicketFoto[]
}

export interface InspeccionCreateInput {
  datos_checklist: ChecklistItem[]
  observaciones_generales?: string
  recomendaciones?: string
  materiales_requeridos?: MaterialItem[]
}

export const DEFAULT_CHECKLIST_CATEGORIAS = [
  {
    categoria: 'Sistema Eléctrico',
    items: [
      'Voltaje de alimentación correcto',
      'Breakers y protecciones en buen estado',
      'Tierra eléctrica funcional',
      'UPS o respaldo de energía operativo',
      'Cableado sin daños visibles',
    ],
  },
  {
    categoria: 'Equipos y Hardware',
    items: [
      'Equipos encienden correctamente',
      'Temperatura de operación normal',
      'Ventilación adecuada',
      'Sin daños físicos evidentes',
      'Firmware/software actualizado',
    ],
  },
  {
    categoria: 'Conectividad de Red',
    items: [
      'Switch/router operativo',
      'Puertos de red sin errores',
      'Velocidad de conexión adecuada',
      'VLANs configuradas correctamente',
      'Acceso remoto funcional',
    ],
  },
  {
    categoria: 'Seguridad Física',
    items: [
      'Gabinetes con acceso controlado',
      'Cámaras de seguridad operativas',
      'Control de acceso funcional',
      'Área de equipos sin acceso no autorizado',
    ],
  },
  {
    categoria: 'Condiciones del Sitio',
    items: [
      'Espacio físico adecuado',
      'Iluminación suficiente',
      'Temperatura ambiente controlada',
      'Sin filtraciones de agua',
      'Organización de cableado aceptable',
    ],
  },
] as const

// ─── Dashboard Mejorado ───────────────────────────────────────────────────────

export interface TechnicianKPI {
  id: string
  nombre: string
  apellido: string
  ticketsCompletados: number
  ticketsActivos: number
  tiempoPromedioMinutos: number
  montoTotal: number
  montoPendiente: number
}

export interface TicketsPorMes {
  mes: string
  servicios: number
  proyectos: number
  finalizados: number
}

export interface ActivityFeedItem {
  id: string
  tipo: ChangeType
  descripcion: string
  usuario: string
  fecha: string
  ticket_numero: string | null
}

export interface EnhancedDashboardStats extends DashboardStats {
  ingresoTotal: number
  ingresoPendiente: number
  ingresoEsteMes: number
  technicianKPIs: TechnicianKPI[]
  ticketsPorMes: TicketsPorMes[]
  actividadReciente: ActivityFeedItem[]
}

// ─── Nómina / Payroll ─────────────────────────────────────────────────────────

export interface PayrollEntry {
  ticket: Ticket
  pago: TechnicianPayment
}

export interface PayrollReport {
  tecnico: User
  periodo: { desde: string; hasta: string }
  entries: PayrollEntry[]
  totalTickets: number
  totalGanado: number
  totalPendiente: number
  totalPagado: number
}

// ─── Comprobante de Servicio ──────────────────────────────────────────────────

export interface ComprobanteServicio {
  ticket: Ticket
  tecnico: User | null
  materiales_usados: MaterialItem[]
  fotos: TicketFoto[]
  inspeccion: Inspeccion | null
  fecha_generacion: string
  numero_comprobante: string
}

// ─── Bloqueadores ─────────────────────────────────────────────────────────────

export interface Bloqueador {
  tipo: TipoBloqueador
  descripcion: string
}

// Extensión de TicketTechnicianInput para incluir bloqueos
export interface TicketStatusChangeInput {
  estado?: TicketStatus
  materiales_usados?: MaterialItem[]
  tiempo_trabajado?: number
  observaciones_tecnico?: string
  solucion_aplicada?: string
  bloqueador?: Bloqueador
}

// ─── Constantes visuales adicionales ─────────────────────────────────────────

export const TIPO_FOTO_COLORS: Record<TipoFoto, string> = {
  progreso: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  inspeccion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  documento: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  antes: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  despues: 'bg-green-500/20 text-green-400 border-green-500/30',
} as const

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  creacion: 'Creación',
  asignacion: 'Asignación',
  cambio_estado: 'Cambio de Estado',
  modificacion: 'Modificación',
  finalizacion: 'Finalización',
  foto_subida: 'Foto Subida',
  inspeccion: 'Inspección',
  sesion_trabajo: 'Sesión de Trabajo',
  bloqueador: 'Bloqueador Reportado',
} as const

// ─── Log de Actualizaciones (timeline en_progreso) ────────────────────────────

export interface UpdateLog {
  id: string
  ticket_id: string
  autor_id: string
  contenido: string
  tipo: 'nota' | 'cambio_estado'
  created_at: string
  autor?: Pick<User, 'nombre' | 'apellido' | 'rol'>
}

// ─── Clientes DB (Sprint 7) ───────────────────────────────────────────────────

// ─── Contactos de Cliente ────────────────────────────────────────────────────

export interface ClienteContacto {
  id: string
  nombre: string
  apellido: string | null
  email: string | null
  telefono: string
  cargo: string | null
  es_principal: boolean
}

export type ClienteStatus = 'activo' | 'inactivo'

export interface Cliente {
  id: string
  nombre: string
  apellido: string | null
  empresa: string | null
  email: string | null
  telefono: string
  direccion: string
  rif_cedula: string | null
  estado: ClienteStatus
  observaciones: string | null
  created_at: string
  updated_at: string
  // Contactos de la empresa
  contactos?: ClienteContacto[]
  // Computed
  tickets_count?: number
  ultimo_ticket_fecha?: string | null
}

export interface ClienteCreateInput {
  nombre: string
  apellido?: string
  empresa?: string
  email?: string
  telefono: string
  direccion: string
  rif_cedula?: string
  observaciones?: string
  contactos?: Omit<ClienteContacto, 'id'>[]
}

export interface ClienteUpdateInput extends Partial<ClienteCreateInput> {
  estado?: ClienteStatus
}

// ─── Cuadro de Pagos (Sprint 7) ───────────────────────────────────────────────

export interface PaymentScheduleRow {
  fecha_finalizacion: string
  ticket_numero: string
  cliente_nombre: string
  cliente_empresa: string | null
  descripcion: string
  monto_servicio: number
  porcentaje_comision: number
  monto_a_pagar: number
  estado_pago: PaymentStatus
  metodo_pago: PaymentMethod | null
  referencia_pago: string | null
}

export interface TechnicianPaymentSchedule {
  tecnico_id: string
  tecnico_nombre: string
  rows: PaymentScheduleRow[]
  subtotal_servicio: number
  subtotal_comision: number
  pagados: number
  pendientes: number
}

export interface PaymentScheduleReport {
  periodo_desde: string
  periodo_hasta: string
  generado_en: string
  generado_por: string
  tecnicos: TechnicianPaymentSchedule[]
  total_servicio: number
  total_comision: number
  total_pagado: number
  total_pendiente: number
}

// ─── Mantenimiento (Sprint 8) ────────────────────────────────────────────────

export type Region = 'Metropolitana centro oeste' | 'Metropolitana sur' | 'Metropolitana este' | 'Region los llanos' | 'Oriente' | 'Occidente' | 'Centro los llanos' | 'Centro occidente' | 'Region centro'
export type EstadoOperativoAgencia = 'activa' | 'mantenimiento' | 'inactiva'

export interface Agencia {
  id: number
  nombre: string
  region: Region
  ciudad: string
  direccion: string | null
  contacto: string | null
  estado_operativo: EstadoOperativoAgencia
  created_at: string
  updated_at: string
}

export type RutinaEstado = 'borrador' | 'programada' | 'en_curso' | 'finalizada'

export interface RutinaMantenimiento {
  id: string
  titulo: string
  trimestre: number
  anio: number
  fecha_inicio: string | null
  fecha_fin: string | null
  regiones: Region[]
  equipos_objetivo: string[]
  presupuesto_viaticos: number | null
  creado_por: string | null
  estado: RutinaEstado
  created_at: string
  updated_at: string
  creador?: User
}

export type VisitaEstado = 'pendiente' | 'en_camino' | 'en_proceso' | 'completada' | 'cancelada'

export interface VisitaMantenimiento {
  id: string
  rutina_id: string
  agencia_id: number
  tecnico_id: string | null
  fecha_programada: string | null
  fecha_realizada: string | null
  estado: VisitaEstado
  equipos_asignados: string[]
  observaciones_programacion: string | null
  created_at: string
  updated_at: string
  agencia?: Agencia
  tecnico?: User
  rutina?: RutinaMantenimiento
}

export interface BitacoraVisita {
  id: string
  visita_id: string
  log: string
  checklist: Array<{
    item: string
    estado: 'pendiente' | 'ok' | 'observacion'
    observacion?: string | null
  }>
  fotos: string[]
  repuestos_usados: string[]
  repuestos_devueltos: string[]
  repuestos_pendientes: string[]
  creado_por: string | null
  created_at: string
  updated_at: string
  creador?: User
}

export type ViaticoEstado = 'planeado' | 'enviado' | 'aprobado' | 'rechazado'

export interface Viatico {
  id: string
  visita_id: string | null
  tecnico_id: string
  rutina_id: string | null
  ruta: string | null
  monto: number
  detalle: string | null
  observaciones: string | null
  estado: ViaticoEstado
  fecha_envio: string | null
  fecha_aprobacion: string | null
  aprobado_por: string | null
  created_at: string
  updated_at: string
  visita?: VisitaMantenimiento
  tecnico?: User
  aprobador?: User
}

export interface AgenciaCreateInput {
  nombre: string
  region: Region
  ciudad: string
  direccion?: string
  contacto?: string
  estado_operativo?: EstadoOperativoAgencia
}

export interface AgenciaUpdateInput extends Partial<AgenciaCreateInput> {}

export interface RutinaCreateInput {
  titulo: string
  trimestre: number
  anio: number
  fecha_inicio: string
  fecha_fin: string
  regiones: Region[]
  agencia_ids?: number[]
  equipos_objetivo: string[]
  presupuesto_viaticos?: number
  estado?: RutinaEstado
}

export interface RutinaUpdateEstadoInput {
  estado: RutinaEstado
}

export interface AssignVisitaInput {
  visita_ids: string[]
  tecnico_id: string
  fecha_programada: string
  observaciones_programacion?: string
}

export interface VisitaEstadoUpdateInput {
  estado: VisitaEstado
}

export interface BitacoraVisitaInput {
  visita_id: string
  log: string
  checklist: BitacoraVisita['checklist']
  fotos?: string[]
  repuestos_usados?: string[]
  repuestos_devueltos?: string[]
  repuestos_pendientes?: string[]
}

export interface ViaticoCreateInput {
  visita_id?: string
  tecnico_id?: string
  rutina_id?: string
  ruta: string
  monto: number
  detalle?: string
  observaciones?: string
}

export interface ViaticoEstadoUpdateInput {
  estado: ViaticoEstado
}

export interface MantenimientoReportes {
  resumen: {
    total_rutinas: number
    total_visitas: number
    visitas_completadas: number
    visitas_pendientes: number
    agencias_atendidas: number
    viaticos_aprobados_monto: number
    viaticos_pendientes_monto: number
  }
  progreso_por_rutina: Array<{
    rutina_id: string
    titulo: string
    estado: RutinaEstado
    total_visitas: number
    completadas: number
    pendientes: number
    porcentaje_avance: number
  }>
  visitas_por_tecnico: Array<{
    tecnico_id: string
    tecnico_nombre: string
    total: number
    completadas: number
    en_proceso: number
  }>
  viaticos_por_rutina: Array<{
    rutina_id: string
    titulo: string
    presupuesto: number
    aprobado: number
    pendiente: number
  }>
  ultimas_bitacoras: Array<{
    bitacora_id: string
    visita_id: string
    agencia_nombre: string
    tecnico_nombre: string
    created_at: string
    log: string
  }>
}
