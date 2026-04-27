/**
 * Movimiento de inventario (entrada, salida o reversión).
 * Fuente de verdad: Firestore colección `catalogo_movimientos`
 * Inmutable: una vez creado, no se modifica.
 */
export interface MovimientoInventario {
  /** Firestore auto-ID */
  id: string
  /** Referencia al producto en catalogo_productos */
  producto_id: string
  /** Tipo de movimiento */
  tipo: "entrada" | "salida" | "reversion"
  /** Cantidad movida (siempre positivo) */
  cantidad: number
  /** ID del ticket relacionado (si aplica) */
  ticket_id?: string
  /** ID de la cotización relacionada (si aplica) */
  cotizacion_id?: string
  /** Notas adicionales */
  notas?: string
  /** Fecha del movimiento ISO 8601 */
  fecha: string
  /** ID del usuario que realizó el movimiento */
  usuario_id: string
}

/** Input para crear un movimiento (sin id) */
export type MovimientoInventarioCreateInput = Omit<MovimientoInventario, "id">
