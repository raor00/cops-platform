import { collection, doc, getDocs, setDoc } from "firebase/firestore"
import type { CatalogoProducto } from "@cops/shared"
import { getFirebaseDb } from "../lib/firebase/config"
import { firestoreGetAll } from "../lib/firebase/firestore-storage"
import { getCatalog } from "../lib/quotation-storage"
import { DEFAULT_CATALOG, type CatalogItem } from "../lib/quotation-types"

const TARGET_COLLECTION = "catalogo_productos"
const SOURCE_COLLECTION = "catalogo-custom"

function normalizeCode(code: string): string {
  return code.trim().toLowerCase()
}

function fallbackId(item: Pick<CatalogItem, "id" | "code">): string {
  if (item.id?.trim()) return item.id.trim()
  return normalizeCode(item.code).replace(/[^a-z0-9_-]+/g, "-")
}

function toCatalogoProducto(
  item: CatalogItem,
  id: string,
  now: string,
  createdAt?: string,
): CatalogoProducto {
  return {
    id,
    code: item.code.trim(),
    description: item.description.trim(),
    unitPrice: Number(item.unitPrice ?? 0),
    costo: Number(item.costo ?? 0),
    category: item.category.trim(),
    brand: item.brand?.trim() || "Generico",
    subcategory: item.subcategory?.trim() || "General",
    variant: item.variant?.trim() || "",
    unit: item.unit.trim() || "UND",
    imageUrl: item.imageUrl?.trim() || "",
    stock: Number(item.stock ?? 0),
    stockMinimo: Number(item.stockMinimo ?? 0),
    ubicacion: item.ubicacion?.trim() || "",
    activo: item.activo ?? true,
    created_at: createdAt ?? item.created_at ?? now,
    updated_at: now,
  }
}

function mergeCatalogItems(...sources: CatalogItem[][]): CatalogItem[] {
  const merged = new Map<string, CatalogItem>()

  for (const source of sources) {
    for (const item of source) {
      const key = normalizeCode(item.code)
      const previous = merged.get(key)
      merged.set(key, {
        ...previous,
        ...item,
        brand: item.brand || previous?.brand || "Generico",
        subcategory: item.subcategory || previous?.subcategory || "General",
        variant: item.variant || previous?.variant || "",
        imageUrl: item.imageUrl || previous?.imageUrl || "",
      })
    }
  }

  return Array.from(merged.values())
}

async function loadSourceCatalog(): Promise<CatalogItem[]> {
  const catalogFromStorage = getCatalog()
  const customCatalog = await firestoreGetAll<CatalogItem>(SOURCE_COLLECTION, "code", "asc")

  return mergeCatalogItems(DEFAULT_CATALOG, catalogFromStorage, customCatalog)
}

async function migrateCatalog(): Promise<void> {
  const now = new Date().toISOString()
  const db = getFirebaseDb()
  const sourceCatalog = await loadSourceCatalog()
  const existingSnapshot = await getDocs(collection(db, TARGET_COLLECTION))

  const existingByCode = new Map<
    string,
    { id: string; created_at?: string }
  >()

  for (const existingDoc of existingSnapshot.docs) {
    const data = existingDoc.data() as Partial<CatalogoProducto>
    if (!data.code) continue
    existingByCode.set(normalizeCode(data.code), {
      id: existingDoc.id,
      created_at: data.created_at,
    })
  }

  let migrated = 0
  const errors: Array<{ code: string; error: string }> = []

  for (const item of sourceCatalog) {
    try {
      const existing = existingByCode.get(normalizeCode(item.code))
      const targetId = existing?.id ?? fallbackId(item)
      const payload = toCatalogoProducto(item, targetId, now, existing?.created_at)

      await setDoc(doc(db, TARGET_COLLECTION, targetId), payload, { merge: true })
      migrated += 1
    } catch (error) {
      errors.push({
        code: item.code,
        error: (error as Error).message,
      })
    }
  }

  console.log(`Migración completada: ${migrated}/${sourceCatalog.length} productos procesados.`)

  if (errors.length > 0) {
    console.error(`Errores: ${errors.length}`)
    for (const entry of errors) {
      console.error(`- ${entry.code}: ${entry.error}`)
    }
    process.exitCode = 1
    return
  }

  console.log("Sin errores.")
}

void migrateCatalog().catch((error) => {
  console.error("Error ejecutando la migración del catálogo:", error)
  process.exitCode = 1
})
