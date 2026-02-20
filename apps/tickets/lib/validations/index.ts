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
    .min(1, 'La contraseÃ±a es requerida')
    .min(6, 'La contraseÃ±a debe tener al menos 6 caracteres'),
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
    .email('Correo electrÃ³nico invÃ¡lido')
    .max(100, 'El correo no puede exceder 100 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseÃ±a es requerida')
    .min(6, 'La contraseÃ±a debe tener al menos 6 caracteres')
    .max(72, 'La contraseÃ±a no puede exceder 72 caracteres'),
  rol: z.enum(['tecnico', 'coordinador', 'gerente', 'vicepresidente', 'presidente'], {
    errorMap: () => ({ message: 'Rol invÃ¡lido' }),
  }),
  telefono: z
    .string()
    .max(20, 'El telÃ©fono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  cedula: z
    .string()
    .min(1, 'La cÃ©dula es requerida')
    .max(20, 'La cÃ©dula no puede exceder 20 caracteres'),
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
    .email('Correo electrÃ³nico invÃ¡lido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional(),
  telefono: z
    .string()
    .max(20, 'El telÃ©fono no puede exceder 20 caracteres')
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
    errorMap: () => ({ message: 'Tipo de ticket invÃ¡lido' }),
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
    .email('Correo electrÃ³nico invÃ¡lido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_telefono: z
    .string()
    .min(1, 'El telÃ©fono del cliente es requerido')
    .max(20, 'El telÃ©fono no puede exceder 20 caracteres'),
  cliente_direccion: z
    .string()
    .min(1, 'La direcciÃ³n del cliente es requerida')
    .max(500, 'La direcciÃ³n no puede exceder 500 caracteres'),
  // DescripciÃ³n del trabajo
  asunto: z
    .string()
    .min(1, 'El asunto es requerido')
    .max(255, 'El asunto no puede exceder 255 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripciÃ³n es requerida')
    .max(5000, 'La descripciÃ³n no puede exceder 5000 caracteres'),
  requerimientos: z
    .string()
    .max(5000, 'Los requerimientos no pueden exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
  materiales_planificados: z.array(materialItemSchema).optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente'], {
    errorMap: () => ({ message: 'Prioridad invÃ¡lida' }),
  }),
  origen: z.enum(['email', 'telefono', 'carta_aceptacion'], {
    errorMap: () => ({ message: 'Origen invÃ¡lido' }),
  }),
  numero_carta: z
    .string()
    .max(50, 'El nÃºmero de carta no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  tipo_mantenimiento: z.enum(['correctivo', 'preventivo']).optional(),
  tecnico_id: z.string().uuid('ID de tÃ©cnico invÃ¡lido').optional().or(z.literal('')),
  monto_servicio: z
    .number()
    .min(0, 'El monto debe ser positivo')
    .optional()
    .default(40),
  ticket_origen_id: z.string().uuid().optional().or(z.literal('')),
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
    .email('Correo electrÃ³nico invÃ¡lido')
    .max(100, 'El correo no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  cliente_telefono: z
    .string()
    .min(1, 'El telÃ©fono del cliente es requerido')
    .max(20, 'El telÃ©fono no puede exceder 20 caracteres')
    .optional(),
  cliente_direccion: z
    .string()
    .min(1, 'La direcciÃ³n del cliente es requerida')
    .max(500, 'La direcciÃ³n no puede exceder 500 caracteres')
    .optional(),
  asunto: z
    .string()
    .min(1, 'El asunto es requerido')
    .max(255, 'El asunto no puede exceder 255 caracteres')
    .optional(),
  descripcion: z
    .string()
    .min(1, 'La descripciÃ³n es requerida')
    .max(5000, 'La descripciÃ³n no puede exceder 5000 caracteres')
    .optional(),
  requerimientos: z
    .string()
    .min(1, 'Los requerimientos son requeridos')
    .max(5000, 'Los requerimientos no pueden exceder 5000 caracteres')
    .optional(),
  materiales_planificados: z.array(materialItemSchema).optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional(),
  tecnico_id: z.string().uuid('ID de tÃ©cnico invÃ¡lido').optional().or(z.literal('')),
  monto_servicio: z.number().min(0, 'El monto debe ser positivo').optional(),
})

export const ticketTechnicianSchema = z.object({
  estado: z.enum(['asignado', 'iniciado', 'en_progreso', 'finalizado', 'cancelado']).optional(),
  materiales_usados: z.array(materialItemSchema).optional(),
  tiempo_trabajado: z
    .number()
    .min(0, 'El tiempo debe ser positivo')
    .optional(),
  observaciones_tecnico: z
    .string()
    .max(5000, 'Las observaciones no pueden exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
  solucion_aplicada: z
    .string()
    .max(5000, 'La soluciÃ³n no puede exceder 5000 caracteres')
    .optional()
    .or(z.literal('')),
})

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// VALIDACIONES DE PAGO
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const paymentProcessSchema = z.object({
  metodo_pago: z.enum(['pago_movil', 'transferencia', 'efectivo', 'deposito', 'cheque'], {
    errorMap: () => ({ message: 'MÃ©todo de pago invÃ¡lido' }),
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

