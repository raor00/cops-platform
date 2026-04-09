import { z } from 'zod'

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VALIDACIONES DE USUARIO
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'El usuario es requerido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const userCreateSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(72, 'La contraseña no puede exceder 72 caracteres'),
  rol: z.enum(['tecnico', 'coordinador', 'gerente', 'vicepresidente', 'presidente'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .max(20, 'La cédula no puede exceder 20 caracteres'),
})

export const userUpdateSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  apellido: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(100, 'El apellido no puede exceder 100 caracteres')
    .optional(),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional(),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  estado: z.enum(['activo', 'inactivo']).optional(),
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VALIDACIONES DE TICKET
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const materialItemSchema = z.object({
  id: z.string(),
  nombre: z.string().min(1, 'El nombre del material es requerido'),
  cantidad: z.number().min(0, 'La cantidad debe ser positiva'),
  unidad: z.string().min(1, 'La unidad es requerida'),
  observacion: z.string().optional(),
})

export const ticketCreateSchema = z.object({
  tipo: z.enum(['servicio', 'proyecto', 'inspeccion'], {
    errorMap: () => ({ message: 'Tipo de ticket inválido' }),
  }),
  // Datos del cliente
  cliente_nombre: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  cliente_empresa: z
    .string()
    .max(150, 'El nombre de la empresa no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_email: z
    .string()
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_telefono: z
    .string()
    .min(1, 'El teléfono del cliente es requerido')
    .max(20, 'El teléfono no puede exceder 20 caracteres'),
  cliente_direccion: z
    .string()
    .min(1, 'La dirección del cliente es requerida')
    .max(500, 'La dirección no puede exceder 500 caracteres'),
  // Descripción del trabajo
  asunto: z
    .string()
    .min(1, 'El asunto es requerido')
    .max(255, 'El asunto no puede exceder 255 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(5000, 'La descripción no puede exceder 5000 caracteres'),
  requerimientos: z
    .string()
    .max(5000, 'Los requerimientos no pueden exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
  materiales_planificados: z.array(materialItemSchema).optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente'], {
    errorMap: () => ({ message: 'Prioridad inválida' }),
  }),
  origen: z.enum(['email', 'telefono', 'carta_aceptacion'], {
    errorMap: () => ({ message: 'Origen inválido' }),
  }),
  numero_carta: z
    .string()
    .max(50, 'El número de carta no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  tipo_mantenimiento: z.enum(['correctivo', 'preventivo']).optional(),
  agencia_bancaribe: z.string().max(150, 'La agencia no puede exceder 150 caracteres').optional().or(z.literal('')),
  cupones_bancaribe: z.number().int().min(0, 'Los cupones deben ser un número positivo').optional(),
  fecha_servicio: z.string().optional().or(z.literal('')),
  tecnico_id: z.string().min(1, 'Debes seleccionar un técnico'),
  monto_servicio: z
    .number()
    .min(0, 'El monto debe ser positivo')
    .optional()
    .default(40),
  ticket_origen_id: z.string().optional().or(z.literal('')),
})

export const ticketUpdateSchema = z.object({
  cliente_nombre: z
    .string()
    .min(1, 'El nombre del cliente es requerido')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .optional(),
  cliente_empresa: z
    .string()
    .max(150, 'El nombre de la empresa no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_email: z
    .string()
    .email('Correo electrónico inválido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_telefono: z
    .string()
    .min(1, 'El teléfono del cliente es requerido')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  cliente_direccion: z
    .string()
    .min(1, 'La dirección del cliente es requerida')
    .max(500, 'La dirección no puede exceder 500 caracteres')
    .optional(),
  asunto: z
    .string()
    .min(1, 'El asunto es requerido')
    .max(255, 'El asunto no puede exceder 255 caracteres')
    .optional(),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .optional(),
  requerimientos: z
    .string()
    .max(5000, 'Los requerimientos no pueden exceder 5000 caracteres')
    .optional(),
  materiales_planificados: z.array(materialItemSchema).optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional(),
  agencia_bancaribe: z.string().max(150, 'La agencia no puede exceder 150 caracteres').optional().or(z.literal('')),
  cupones_bancaribe: z.number().int().min(0, 'Los cupones deben ser un número positivo').optional(),
  fecha_servicio: z.string().optional().or(z.literal('')),
  tecnico_id: z.string().optional().or(z.literal('')),
  monto_servicio: z.number().min(0, 'El monto debe ser positivo').optional(),
})

export const ticketTechnicianSchema = z.object({
  estado: z.enum(['asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado']).optional(),
  materiales_usados: z.array(materialItemSchema).optional(),
  tiempo_trabajado: z
    .number()
    .min(0, 'El tiempo debe ser positivo')
    .optional(),
  motivo_pausa: z
    .string()
    .max(500, 'El motivo no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  fecha_servicio: z.string().optional().or(z.literal('')),
  observaciones_tecnico: z
    .string()
    .max(5000, 'Las observaciones no pueden exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
  solucion_aplicada: z
    .string()
    .max(5000, 'La solución no puede exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VALIDACIONES DE PAGO
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const paymentProcessSchema = z.object({
  metodo_pago: z.enum(['pago_movil', 'transferencia', 'efectivo', 'deposito', 'cheque'], {
    errorMap: () => ({ message: 'Método de pago inválido' }),
  }),
  referencia_pago: z
    .string()
    .max(1000, 'La referencia no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  observaciones: z
    .string()
    .max(500, 'Las observaciones no pueden exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
})

const regionValues = [
  'Metropolitana centro oeste',
  'Metropolitana sur',
  'Metropolitana este',
  'Region los llanos',
  'Oriente',
  'Occidente',
  'Centro los llanos',
  'Centro occidente',
  'Region centro',
] as const

const rutinaEstadoValues = ['borrador', 'programada', 'en_curso', 'finalizada'] as const
const visitaEstadoValues = ['pendiente', 'en_camino', 'en_proceso', 'completada', 'cancelada'] as const
const viaticoEstadoValues = ['planeado', 'enviado', 'aprobado', 'rechazado'] as const
const agenciaEstadoValues = ['activa', 'mantenimiento', 'inactiva'] as const

export const agenciaCreateSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido').max(255, 'El nombre no puede exceder 255 caracteres'),
  region: z.enum(regionValues, { errorMap: () => ({ message: 'Región inválida' }) }),
  ciudad: z.string().min(2, 'La ciudad es requerida').max(120, 'La ciudad no puede exceder 120 caracteres'),
  direccion: z.string().max(500, 'La dirección no puede exceder 500 caracteres').optional().or(z.literal('')),
  contacto: z.string().max(255, 'El contacto no puede exceder 255 caracteres').optional().or(z.literal('')),
  estado_operativo: z.enum(agenciaEstadoValues).optional(),
})

export const agenciaUpdateSchema = agenciaCreateSchema.partial()

export const rutinaCreateSchema = z.object({
  titulo: z.string().min(3, 'El título es requerido').max(255, 'El título no puede exceder 255 caracteres'),
  trimestre: z.number().int().min(1, 'Trimestre inválido').max(4, 'Trimestre inválido'),
  anio: z.number().int().min(2020, 'Año inválido').max(2050, 'Año inválido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  regiones: z.array(z.enum(regionValues)).min(1, 'Debes seleccionar al menos una región'),
  agencia_ids: z.array(z.number().int().positive()).optional(),
  equipos_objetivo: z.array(z.string().min(1, 'Equipo inválido')).min(1, 'Debes seleccionar al menos un equipo'),
  presupuesto_viaticos: z.number().min(0, 'El presupuesto debe ser positivo').optional(),
  estado: z.enum(rutinaEstadoValues).optional(),
})

export const rutinaEstadoSchema = z.object({
  estado: z.enum(rutinaEstadoValues),
})

export const assignVisitaSchema = z.object({
  visita_ids: z.array(z.string().min(1)).min(1, 'Debes seleccionar al menos una visita'),
  tecnico_id: z.string().min(1, 'Técnico inválido'),
  fecha_programada: z.string().min(1, 'La fecha programada es requerida'),
  observaciones_programacion: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().or(z.literal('')),
})

export const visitaEstadoSchema = z.object({
  estado: z.enum(visitaEstadoValues),
})

export const bitacoraItemSchema = z.object({
  item: z.string().min(1, 'El ítem es requerido'),
  estado: z.enum(['pendiente', 'ok', 'observacion']),
  observacion: z.string().max(500, 'La observación no puede exceder 500 caracteres').optional().or(z.literal('')),
})

export const bitacoraVisitaSchema = z.object({
  visita_id: z.string().min(1, 'Visita inválida'),
  log: z.string().max(5000, 'El resumen no puede exceder 5000 caracteres'),
  checklist: z.array(bitacoraItemSchema),
  fotos: z.array(z.string()).optional(),
  repuestos_usados: z.array(z.string()).optional(),
  repuestos_devueltos: z.array(z.string()).optional(),
  repuestos_pendientes: z.array(z.string()).optional(),
}).refine((data) => {
  const hasLog = data.log.trim().length > 0
  const hasChecklist = data.checklist.some((item) => item.estado !== 'pendiente' || (item.observacion?.trim().length ?? 0) > 0)
  return hasLog || hasChecklist
}, {
  message: 'Debes registrar al menos una observación o checklist',
  path: ['log'],
})

export const viaticoCreateSchema = z.object({
  visita_id: z.string().optional().or(z.literal('')),
  tecnico_id: z.string().optional().or(z.literal('')),
  rutina_id: z.string().optional().or(z.literal('')),
  ruta: z.string().min(3, 'La ruta es requerida').max(255, 'La ruta no puede exceder 255 caracteres'),
  monto: z.number().min(0, 'El monto debe ser positivo'),
  detalle: z.string().max(1000, 'El detalle no puede exceder 1000 caracteres').optional().or(z.literal('')),
  observaciones: z.string().max(1000, 'Las observaciones no pueden exceder 1000 caracteres').optional().or(z.literal('')),
})

export const viaticoEstadoSchema = z.object({
  estado: z.enum(viaticoEstadoValues),
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TIPOS INFERIDOS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type LoginInput = z.infer<typeof loginSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>
export type TicketUpdateInput = z.infer<typeof ticketUpdateSchema>
export type TicketTechnicianInput = z.infer<typeof ticketTechnicianSchema>
export type PaymentProcessInput = z.infer<typeof paymentProcessSchema>
export type AgenciaCreateValidationInput = z.infer<typeof agenciaCreateSchema>
export type AgenciaUpdateValidationInput = z.infer<typeof agenciaUpdateSchema>
export type RutinaCreateValidationInput = z.infer<typeof rutinaCreateSchema>
export type AssignVisitaValidationInput = z.infer<typeof assignVisitaSchema>
export type BitacoraVisitaValidationInput = z.infer<typeof bitacoraVisitaSchema>
export type ViaticoCreateValidationInput = z.infer<typeof viaticoCreateSchema>
