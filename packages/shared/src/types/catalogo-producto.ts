/**
 * Producto del catálogo compartido entre cotizaciones y tickets.
 * Fuente de verdad: Firestore colección `catalogo_productos`
 */
export interface CatalogoProducto {
  /** Firestore auto-ID */
  id: string
  /** SKU único (indexado, case-insensitive) */
  code: string
  description: string
  /** Precio de venta en USD */
  unitPrice: number
  /** Costo de adquisición en USD (opcional) */
  costo?: number
  /** Categoría principal */
  category: string
  /** Marca del producto */
  brand?: string
  /** Subcategoría */
  subcategory?: string
  /** Variante */
  variant?: string
  /** Unidad de medida: UND, BOB, MTS, RLL, KIT, GLB, etc. */
  unit: string
  /** URL de imagen */
  imageUrl?: string
  /** Cantidad actual en inventario (>= 0) */
  stock: number
  /** Umbral de alerta de stock bajo (>= 0) */
  stockMinimo: number
  /** Ubicación física (estante, bodega, etc.) */
  ubicacion?: string
  /** Si está disponible para venta/cotización */
  activo: boolean
  /** Fecha de creación ISO 8601 */
  created_at: string
  /** Fecha de actualización ISO 8601 */
  updated_at: string
}

/** Input para crear un nuevo producto (sin id ni timestamps) */
export type CatalogoProductoCreateInput = Omit<CatalogoProducto, "id" | "created_at" | "updated_at">

/** Input para actualizar un producto (todos los campos opcionales excepto id) */
export type CatalogoProductoUpdateInput = Partial<Omit<CatalogoProducto, "id" | "created_at" | "updated_at">>
