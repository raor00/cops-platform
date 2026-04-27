"use server"

import type { CatalogoProducto, MovimientoInventario } from "@cops/shared"
import type { ActionResponse, MaterialItem } from "@/types"
import { hasPermission } from "@/types"
import { getCurrentUser } from "./auth"
import { isFirebaseMode } from "@/lib/local-mode"
import { cleanForFirestore, fromFirestoreDoc, getAdminFirestore } from "@/lib/firebase/admin"
import {
  buildStockAlertRows,
  filterCatalogProductsByQuery,
  findCatalogProductForMaterial,
  type StockAlertRow,
} from "@/lib/catalogo-utils"

const PRODUCTOS_COLLECTION = "catalogo_productos"
const MOVIMIENTOS_COLLECTION = "catalogo_movimientos"

type CatalogoProductoRecord = Partial<CatalogoProducto>

interface StockMutationResult {
  producto: CatalogoProducto
  movimiento: MovimientoInventario
}

interface TicketStockMutationResult {
  productos: CatalogoProducto[]
  movimientos: MovimientoInventario[]
}

function normalizeCode(code: string): string {
  return code.trim().toLowerCase()
}

function normalizeCatalogoProducto(
  id: string,
  input: CatalogoProductoRecord,
): CatalogoProducto {
  const now = new Date().toISOString()

  return {
    id,
    code: String(input.code ?? "").trim(),
    description: String(input.description ?? "").trim(),
    unitPrice: Number(input.unitPrice ?? 0),
    costo: Number(input.costo ?? 0),
    category: String(input.category ?? "").trim(),
    brand: input.brand?.trim() || "Generico",
    subcategory: input.subcategory?.trim() || "General",
    variant: input.variant?.trim() || "",
    unit: String(input.unit ?? "UND").trim() || "UND",
    imageUrl: input.imageUrl?.trim() || "",
    stock: Number(input.stock ?? 0),
    stockMinimo: Number(input.stockMinimo ?? 0),
    ubicacion: input.ubicacion?.trim() || "",
    activo: input.activo ?? true,
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? input.created_at ?? now,
  }
}

async function ensureCatalogReadAccess(): Promise<ActionResponse<null>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  const canRead =
    hasPermission(currentUser, "tickets:view_own") ||
    hasPermission(currentUser, "tickets:view_all") ||
    hasPermission(currentUser, "tickets:edit")

  if (!canRead) return { success: false, error: "Sin permisos" }
  if (!isFirebaseMode()) return { success: false, error: "Catálogo de productos requiere Firebase válido" }

  return { success: true, data: null }
}

async function ensureStockMutationAccess(usuarioId: string): Promise<ActionResponse<{ actorId: string }>> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { success: false, error: "No autenticado" }

  const canMutate =
    hasPermission(currentUser, "tickets:change_status") ||
    hasPermission(currentUser, "tickets:edit")

  if (!canMutate) return { success: false, error: "Sin permisos" }
  if (!isFirebaseMode()) return { success: false, error: "Catálogo de productos requiere Firebase válido" }

  if (usuarioId.trim() && usuarioId !== currentUser.id && !hasPermission(currentUser, "tickets:edit")) {
    return { success: false, error: "No puedes registrar movimientos para otro usuario" }
  }

  return { success: true, data: { actorId: usuarioId.trim() || currentUser.id } }
}

async function listCatalogoProductos(): Promise<CatalogoProducto[]> {
  const db = getAdminFirestore()
  const snap = await db.collection(PRODUCTOS_COLLECTION).get()

  return snap.docs
    .map((productDoc) => normalizeCatalogoProducto(productDoc.id, fromFirestoreDoc<CatalogoProductoRecord>(productDoc.id, productDoc.data())))
    .sort((a, b) => a.code.localeCompare(b.code, "es", { sensitivity: "base" }))
}

function buildMovimientoNota(tipo: "salida" | "reversion", ticketId: string): string {
  return tipo === "salida"
    ? `Descuento de stock asociado al ticket ${ticketId}`
    : `Reintegro de stock asociado al ticket ${ticketId}`
}

async function mutateTicketMaterialsStock(
  materiales: MaterialItem[],
  ticketId: string,
  usuarioId: string,
  tipo: "salida" | "reversion",
): Promise<ActionResponse<TicketStockMutationResult>> {
  const access = await ensureStockMutationAccess(usuarioId)
  if (!access.success || !access.data) return { success: false, error: access.error }

  const actorId = access.data.actorId

  if (!ticketId.trim()) return { success: false, error: "El ticket es obligatorio" }

  const materialesValidos = materiales.filter((material) => material.nombre.trim() && Number(material.cantidad) > 0)
  if (materialesValidos.length === 0) {
    return { success: true, data: { productos: [], movimientos: [] }, message: "Sin materiales para procesar" }
  }

  try {
    const db = getAdminFirestore()
    const productos = await listCatalogoProductos()
    const materialesResueltos = materialesValidos.map((material) => {
      const match = findCatalogProductForMaterial(material, productos)
      if (!match.producto) {
        throw new Error(`Material no encontrado en catálogo: ${material.nombre}`)
      }

      if (tipo === "salida" && match.producto.stock < material.cantidad) {
        throw new Error(`Stock insuficiente para ${match.producto.description}`)
      }

      return { material, producto: match.producto }
    })

    const now = new Date().toISOString()

    const result = await db.runTransaction<TicketStockMutationResult>(async (transaction) => {
      const productosActualizados: CatalogoProducto[] = []
      const movimientos: MovimientoInventario[] = []

      for (const { material, producto } of materialesResueltos) {
        const productoRef = db.collection(PRODUCTOS_COLLECTION).doc(producto.id)
        const productoSnap = await transaction.get(productoRef)
        if (!productoSnap.exists) throw new Error(`Material no encontrado en catálogo: ${material.nombre}`)

        const productoActual = normalizeCatalogoProducto(
          productoSnap.id,
          fromFirestoreDoc<CatalogoProductoRecord>(productoSnap.id, productoSnap.data()!),
        )

        if (!productoActual.activo) throw new Error(`Material no encontrado en catálogo: ${material.nombre}`)
        if (tipo === "salida" && productoActual.stock < material.cantidad) {
          throw new Error(`Stock insuficiente para ${productoActual.description}`)
        }

        const nuevoStock = tipo === "salida"
          ? productoActual.stock - material.cantidad
          : productoActual.stock + material.cantidad

        const updatedProduct: CatalogoProducto = {
          ...productoActual,
          stock: nuevoStock,
          updated_at: now,
        }

        const movimientoRef = db.collection(MOVIMIENTOS_COLLECTION).doc()
        const movimiento: MovimientoInventario = {
          id: movimientoRef.id,
          producto_id: productoActual.id,
          tipo,
          cantidad: material.cantidad,
          ticket_id: ticketId,
          fecha: now,
          usuario_id: actorId,
          notas: buildMovimientoNota(tipo, ticketId),
        }

        transaction.set(productoRef, cleanForFirestore(updatedProduct), { merge: true })
        transaction.set(movimientoRef, cleanForFirestore(movimiento))

        productosActualizados.push(updatedProduct)
        movimientos.push(movimiento)
      }

      return { productos: productosActualizados, movimientos }
    })

    return {
      success: true,
      data: result,
      message: tipo === "salida" ? "Stock descontado" : "Stock reintegrado",
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCatalogoProductos(): Promise<ActionResponse<CatalogoProducto[]>> {
  const access = await ensureCatalogReadAccess()
  if (!access.success) return { success: false, error: access.error }

  try {
    const productos = await listCatalogoProductos()
    return { success: true, data: productos.filter((producto) => producto.activo) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCatalogoProductoById(id: string): Promise<ActionResponse<CatalogoProducto>> {
  const access = await ensureCatalogReadAccess()
  if (!access.success) return { success: false, error: access.error }

  try {
    if (!id.trim()) return { success: false, error: "El ID del producto es obligatorio" }

    const snap = await getAdminFirestore().collection(PRODUCTOS_COLLECTION).doc(id).get()
    if (!snap.exists) return { success: false, error: "Producto no encontrado" }

    return {
      success: true,
      data: normalizeCatalogoProducto(snap.id, fromFirestoreDoc<CatalogoProductoRecord>(snap.id, snap.data()!)),
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCatalogoProductoByCode(code: string): Promise<ActionResponse<CatalogoProducto>> {
  const access = await ensureCatalogReadAccess()
  if (!access.success) return { success: false, error: access.error }

  try {
    const normalizedCode = normalizeCode(code)
    if (!normalizedCode) return { success: false, error: "El código del producto es obligatorio" }

    const productos = await listCatalogoProductos()
    const producto = productos.find((item) => normalizeCode(item.code) === normalizedCode)

    if (!producto) return { success: false, error: "Producto no encontrado" }

    return { success: true, data: producto }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function buscarProductoPorNombre(
  query: string,
  excludeIds: string[] = [],
): Promise<ActionResponse<CatalogoProducto[]>> {
  const access = await ensureCatalogReadAccess()
  if (!access.success) return { success: false, error: access.error }

  try {
    const productos = await listCatalogoProductos()
    const matches = filterCatalogProductsByQuery(productos, query, excludeIds).slice(0, 8)
    return { success: true, data: matches }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getAlertasStock(): Promise<ActionResponse<StockAlertRow[]>> {
  const access = await ensureCatalogReadAccess()
  if (!access.success) return { success: false, error: access.error }

  try {
    const productos = await listCatalogoProductos()
    return { success: true, data: buildStockAlertRows(productos) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function descontarStockMaterialesTicket(
  materiales: MaterialItem[],
  ticketId: string,
  usuarioId: string,
): Promise<ActionResponse<TicketStockMutationResult>> {
  return mutateTicketMaterialsStock(materiales, ticketId, usuarioId, "salida")
}

export async function reintegrarStockMaterialesTicket(
  materiales: MaterialItem[],
  ticketId: string,
  usuarioId: string,
): Promise<ActionResponse<TicketStockMutationResult>> {
  return mutateTicketMaterialsStock(materiales, ticketId, usuarioId, "reversion")
}

export async function descontarStock(
  productoId: string,
  cantidad: number,
  ticketId: string,
  usuarioId: string,
): Promise<ActionResponse<StockMutationResult>> {
  const access = await ensureStockMutationAccess(usuarioId)
  if (!access.success || !access.data) return { success: false, error: access.error }

  const actorId = access.data.actorId

  if (!productoId.trim()) return { success: false, error: "El ID del producto es obligatorio" }
  if (!ticketId.trim()) return { success: false, error: "El ticket es obligatorio" }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero" }
  }

  try {
    const db = getAdminFirestore()
    const productoRef = db.collection(PRODUCTOS_COLLECTION).doc(productoId)
    const movimientoRef = db.collection(MOVIMIENTOS_COLLECTION).doc()
    const now = new Date().toISOString()

    const result = await db.runTransaction<StockMutationResult>(async (transaction) => {
      const productoSnap = await transaction.get(productoRef)
      if (!productoSnap.exists) throw new Error("Producto no encontrado")

      const productoActual = normalizeCatalogoProducto(
        productoSnap.id,
        fromFirestoreDoc<CatalogoProductoRecord>(productoSnap.id, productoSnap.data()!),
      )

      if (!productoActual.activo) throw new Error("El producto está inactivo")
      if (productoActual.stock < cantidad) throw new Error("Stock insuficiente")

      const updatedProduct: CatalogoProducto = {
        ...productoActual,
        stock: productoActual.stock - cantidad,
        updated_at: now,
      }

      const movimiento: MovimientoInventario = {
        id: movimientoRef.id,
        producto_id: productoId,
        tipo: "salida",
        cantidad,
        ticket_id: ticketId,
        fecha: now,
        usuario_id: actorId,
        notas: buildMovimientoNota("salida", ticketId),
      }

      transaction.set(productoRef, cleanForFirestore(updatedProduct), { merge: true })
      transaction.set(movimientoRef, cleanForFirestore(movimiento))

      return { producto: updatedProduct, movimiento }
    })

    return { success: true, data: result, message: "Stock descontado" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function reintegrarStock(
  productoId: string,
  cantidad: number,
  ticketId: string,
  usuarioId: string,
): Promise<ActionResponse<StockMutationResult>> {
  const access = await ensureStockMutationAccess(usuarioId)
  if (!access.success || !access.data) return { success: false, error: access.error }

  const actorId = access.data.actorId

  if (!productoId.trim()) return { success: false, error: "El ID del producto es obligatorio" }
  if (!ticketId.trim()) return { success: false, error: "El ticket es obligatorio" }
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero" }
  }

  try {
    const db = getAdminFirestore()
    const productoRef = db.collection(PRODUCTOS_COLLECTION).doc(productoId)
    const movimientoRef = db.collection(MOVIMIENTOS_COLLECTION).doc()
    const now = new Date().toISOString()

    const result = await db.runTransaction<StockMutationResult>(async (transaction) => {
      const productoSnap = await transaction.get(productoRef)
      if (!productoSnap.exists) throw new Error("Producto no encontrado")

      const productoActual = normalizeCatalogoProducto(
        productoSnap.id,
        fromFirestoreDoc<CatalogoProductoRecord>(productoSnap.id, productoSnap.data()!),
      )

      if (!productoActual.activo) throw new Error("El producto está inactivo")

      const updatedProduct: CatalogoProducto = {
        ...productoActual,
        stock: productoActual.stock + cantidad,
        updated_at: now,
      }

      const movimiento: MovimientoInventario = {
        id: movimientoRef.id,
        producto_id: productoId,
        tipo: "reversion",
        cantidad,
        ticket_id: ticketId,
        fecha: now,
        usuario_id: actorId,
        notas: buildMovimientoNota("reversion", ticketId),
      }

      transaction.set(productoRef, cleanForFirestore(updatedProduct), { merge: true })
      transaction.set(movimientoRef, cleanForFirestore(movimiento))

      return { producto: updatedProduct, movimiento }
    })

    return { success: true, data: result, message: "Stock reintegrado" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
