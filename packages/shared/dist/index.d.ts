/**
 * Producto del catálogo compartido entre cotizaciones y tickets.
 * Fuente de verdad: Firestore colección `catalogo_productos`
 */
interface CatalogoProducto {
    /** Firestore auto-ID */
    id: string;
    /** SKU único (indexado, case-insensitive) */
    code: string;
    description: string;
    /** Precio de venta en USD */
    unitPrice: number;
    /** Costo de adquisición en USD (opcional) */
    costo?: number;
    /** Categoría principal */
    category: string;
    /** Marca del producto */
    brand?: string;
    /** Subcategoría */
    subcategory?: string;
    /** Variante */
    variant?: string;
    /** Unidad de medida: UND, BOB, MTS, RLL, KIT, GLB, etc. */
    unit: string;
    /** URL de imagen */
    imageUrl?: string;
    /** Cantidad actual en inventario (>= 0) */
    stock: number;
    /** Umbral de alerta de stock bajo (>= 0) */
    stockMinimo: number;
    /** Ubicación física (estante, bodega, etc.) */
    ubicacion?: string;
    /** Si está disponible para venta/cotización */
    activo: boolean;
    /** Fecha de creación ISO 8601 */
    created_at: string;
    /** Fecha de actualización ISO 8601 */
    updated_at: string;
}
/** Input para crear un nuevo producto (sin id ni timestamps) */
type CatalogoProductoCreateInput = Omit<CatalogoProducto, "id" | "created_at" | "updated_at">;
/** Input para actualizar un producto (todos los campos opcionales excepto id) */
type CatalogoProductoUpdateInput = Partial<Omit<CatalogoProducto, "id" | "created_at" | "updated_at">>;

/**
 * Movimiento de inventario (entrada, salida o reversión).
 * Fuente de verdad: Firestore colección `catalogo_movimientos`
 * Inmutable: una vez creado, no se modifica.
 */
interface MovimientoInventario {
    /** Firestore auto-ID */
    id: string;
    /** Referencia al producto en catalogo_productos */
    producto_id: string;
    /** Tipo de movimiento */
    tipo: "entrada" | "salida" | "reversion";
    /** Cantidad movida (siempre positivo) */
    cantidad: number;
    /** ID del ticket relacionado (si aplica) */
    ticket_id?: string;
    /** ID de la cotización relacionada (si aplica) */
    cotizacion_id?: string;
    /** Notas adicionales */
    notas?: string;
    /** Fecha del movimiento ISO 8601 */
    fecha: string;
    /** ID del usuario que realizó el movimiento */
    usuario_id: string;
}
/** Input para crear un movimiento (sin id) */
type MovimientoInventarioCreateInput = Omit<MovimientoInventario, "id">;

/**
 * Contacto secundario de un cliente.
 */
interface ClienteContacto {
    id: string;
    nombre: string;
    apellido?: string;
    email?: string;
    telefono?: string;
    cargo?: string;
    /** Si es el contacto principal */
    es_principal: boolean;
}
/**
 * Cliente compartido entre cotizaciones y tickets.
 * Fuente de verdad: Firestore colección `clientes`
 */
interface Cliente {
    /** Firestore auto-ID */
    id: string;
    nombre: string;
    apellido?: string;
    empresa?: string;
    email?: string;
    telefono: string;
    direccion: string;
    rif_cedula?: string;
    estado: "activo" | "inactivo";
    observaciones?: string;
    contactos?: ClienteContacto[];
    /** Fecha de creación ISO 8601 */
    created_at: string;
    /** Fecha de actualización ISO 8601 */
    updated_at: string;
}
/** Input para crear un nuevo cliente (sin id ni timestamps) */
type ClienteCreateInput = Omit<Cliente, "id" | "created_at" | "updated_at">;
/** Input para actualizar un cliente (todos los campos opcionales excepto id) */
type ClienteUpdateInput = Partial<Omit<Cliente, "id" | "created_at" | "updated_at">>;

export type { CatalogoProducto, CatalogoProductoCreateInput, CatalogoProductoUpdateInput, Cliente, ClienteContacto, ClienteCreateInput, ClienteUpdateInput, MovimientoInventario, MovimientoInventarioCreateInput };
