import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore"
import type {
  CatalogoProducto,
  CatalogoProductoCreateInput,
  CatalogoProductoUpdateInput,
} from "@cops/shared"
import { getFirebaseDb } from "./firebase/config"
import { cleanDoc } from "./firebase/firestore-storage"

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

const COLLECTION_NAME = "catalogo_productos"

type CatalogoProductoRecord = Partial<CatalogoProducto>

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

function validateRequiredFields(
  input: Pick<CatalogoProducto, "code" | "description" | "category" | "unit"> &
    Pick<CatalogoProducto, "unitPrice" | "stock" | "stockMinimo">,
): string | null {
  if (!input.code.trim()) return "El código del producto es obligatorio"
  if (!input.description.trim()) return "La descripción del producto es obligatoria"
  if (!input.category.trim()) return "La categoría del producto es obligatoria"
  if (!input.unit.trim()) return "La unidad del producto es obligatoria"
  if (input.unitPrice < 0) return "El precio no puede ser negativo"
  if (input.stock < 0) return "El stock no puede ser negativo"
  if (input.stockMinimo < 0) return "El stock mínimo no puede ser negativo"
  return null
}

async function listCatalogoProductos(): Promise<CatalogoProducto[]> {
  const db = getFirebaseDb()
  const snap = await getDocs(collection(db, COLLECTION_NAME))

  return snap.docs
    .map((itemDoc) => normalizeCatalogoProducto(itemDoc.id, itemDoc.data() as CatalogoProductoRecord))
    .sort((a, b) => a.code.localeCompare(b.code, "es", { sensitivity: "base" }))
}

export async function getCatalogoProductos(): Promise<ActionResponse<CatalogoProducto[]>> {
  try {
    const productos = await listCatalogoProductos()
    return { success: true, data: productos.filter((producto) => producto.activo) }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCatalogoProductoById(id: string): Promise<ActionResponse<CatalogoProducto>> {
  try {
    if (!id.trim()) return { success: false, error: "El ID del producto es obligatorio" }

    const db = getFirebaseDb()
    const productDoc = await getDoc(doc(db, COLLECTION_NAME, id))

    if (!productDoc.exists()) return { success: false, error: "Producto no encontrado" }

    return {
      success: true,
      data: normalizeCatalogoProducto(productDoc.id, productDoc.data() as CatalogoProductoRecord),
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function getCatalogoProductoByCode(code: string): Promise<ActionResponse<CatalogoProducto>> {
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

export async function createCatalogoProducto(
  input: CatalogoProductoCreateInput,
): Promise<ActionResponse<CatalogoProducto>> {
  try {
    const normalized = normalizeCatalogoProducto("temp", {
      ...input,
      activo: input.activo ?? true,
      costo: input.costo ?? 0,
      stock: input.stock ?? 0,
      stockMinimo: input.stockMinimo ?? 0,
      ubicacion: input.ubicacion ?? "",
    })

    const validationError = validateRequiredFields(normalized)
    if (validationError) return { success: false, error: validationError }

    const existing = await getCatalogoProductoByCode(normalized.code)
    if (existing.success) return { success: false, error: "Ya existe un producto con ese código" }

    const db = getFirebaseDb()
    const now = new Date().toISOString()
    const payload = cleanDoc({
      ...normalized,
      created_at: now,
      updated_at: now,
    })

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload)
    const producto = normalizeCatalogoProducto(docRef.id, { ...payload, id: docRef.id })

    await setDoc(doc(db, COLLECTION_NAME, docRef.id), cleanDoc(producto), { merge: true })

    return { success: true, data: producto, message: "Producto creado exitosamente" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function updateCatalogoProducto(
  id: string,
  updates: CatalogoProductoUpdateInput,
): Promise<ActionResponse<CatalogoProducto>> {
  try {
    if (!id.trim()) return { success: false, error: "El ID del producto es obligatorio" }

    const db = getFirebaseDb()
    const ref = doc(db, COLLECTION_NAME, id)
    const currentDoc = await getDoc(ref)

    if (!currentDoc.exists()) return { success: false, error: "Producto no encontrado" }

    const current = normalizeCatalogoProducto(id, currentDoc.data() as CatalogoProductoRecord)
    const next = normalizeCatalogoProducto(id, {
      ...current,
      ...updates,
      created_at: current.created_at,
      updated_at: new Date().toISOString(),
    })

    const validationError = validateRequiredFields(next)
    if (validationError) return { success: false, error: validationError }

    if (normalizeCode(next.code) !== normalizeCode(current.code)) {
      const duplicate = await getCatalogoProductoByCode(next.code)
      if (duplicate.success && duplicate.data?.id !== id) {
        return { success: false, error: "Ya existe un producto con ese código" }
      }
    }

    await setDoc(ref, cleanDoc(next), { merge: true })
    return { success: true, data: next, message: "Producto actualizado" }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function softDeleteCatalogoProducto(
  id: string,
): Promise<ActionResponse<CatalogoProducto>> {
  try {
    const current = await getCatalogoProductoById(id)
    if (!current.success || !current.data) return current

    return updateCatalogoProducto(id, { activo: false })
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
