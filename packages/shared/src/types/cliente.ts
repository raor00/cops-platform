/**
 * Contacto secundario de un cliente.
 */
export interface ClienteContacto {
  id: string
  nombre: string
  apellido?: string
  email?: string
  telefono?: string
  cargo?: string
  /** Si es el contacto principal */
  es_principal: boolean
}

/**
 * Cliente compartido entre cotizaciones y tickets.
 * Fuente de verdad: Firestore colección `clientes`
 */
export interface Cliente {
  /** Firestore auto-ID */
  id: string
  nombre: string
  apellido?: string
  empresa?: string
  email?: string
  telefono: string
  direccion: string
  rif_cedula?: string
  estado: "activo" | "inactivo"
  observaciones?: string
  contactos?: ClienteContacto[]
  /** Fecha de creación ISO 8601 */
  created_at: string
  /** Fecha de actualización ISO 8601 */
  updated_at: string
}

/** Input para crear un nuevo cliente (sin id ni timestamps) */
export type ClienteCreateInput = Omit<Cliente, "id" | "created_at" | "updated_at">

/** Input para actualizar un cliente (todos los campos opcionales excepto id) */
export type ClienteUpdateInput = Partial<Omit<Cliente, "id" | "created_at" | "updated_at">>
