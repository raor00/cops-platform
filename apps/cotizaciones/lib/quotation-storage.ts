import type { QuotationData, CatalogItem, CatalogDiscountConfig } from "./quotation-types"
import { DEFAULT_CATALOG } from "./quotation-types"
import {
  firestoreGetAll,
  firestoreGetById,
  firestoreSave,
  firestoreDelete,
  firestoreSetField,
} from "./firebase/firestore-storage"

const QUOTATIONS_KEY = "cops_quotations"
const CATALOG_KEY = "cops_catalog_v2"
const CATALOG_DISCOUNT_KEY = "cops_catalog_discount"

function emitCatalogUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("catalog-updated"))
  }
}

// ─── Cache local (localStorage) ─────────────────────────────

function getQuotationsLocal(): QuotationData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUOTATIONS_KEY)
    return raw ? (JSON.parse(raw) as QuotationData[]) : []
  } catch {
    return []
  }
}

function setQuotationsLocal(data: QuotationData[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(data))
  }
}

// ─── Sync inicial: Firestore → localStorage ───────────────────────────────────
// Llamar una vez al montar la app (app-shell.tsx) para hidratar el caché local.

export async function syncCotizacionesFromFirestore(): Promise<void> {
  try {
    const [quotations, deliveryNotes, transportGuides, customCatalog, discountRaw] = await Promise.all([
      firestoreGetAll<QuotationData>("cotizaciones"),
      firestoreGetAll<{ id: string }>("notas-entrega"),
      firestoreGetAll<{ id: string }>("guias-transporte"),
      firestoreGetAll<CatalogItem>("catalogo-custom"),
      firestoreGetById<CatalogDiscountConfig>("catalogo-config", "discount"),
    ])
    if (typeof window === "undefined") return
    if (quotations.length > 0) localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(quotations))
    if (deliveryNotes.length > 0) localStorage.setItem("cops_delivery_notes", JSON.stringify(deliveryNotes))
    if (transportGuides.length > 0) localStorage.setItem("cops_transport_guides", JSON.stringify(transportGuides))
    if (customCatalog.length > 0) localStorage.setItem(CATALOG_KEY, JSON.stringify(customCatalog))
    if (discountRaw) localStorage.setItem(CATALOG_DISCOUNT_KEY, JSON.stringify(discountRaw))
    window.dispatchEvent(new Event("firestore-synced"))
  } catch (err) {
    console.error("[Firebase] Error sincronizando desde Firestore:", err)
  }
}

// ─── Cotizaciones ─────────────────────────────────────────────

export function saveQuotation(data: QuotationData): void {
  const existing = getQuotationsLocal()
  const idx = existing.findIndex((q) => q.id === data.id)
  let toSave: QuotationData
  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx]!.createdAt }
    toSave = existing[idx]!
  } else {
    existing.unshift(data)
    toSave = data
  }
  setQuotationsLocal(existing)
  firestoreSave("cotizaciones", toSave).catch(console.error)
}

export function getQuotations(): QuotationData[] {
  return getQuotationsLocal()
}

export function getQuotationById(id: string): QuotationData | undefined {
  return getQuotationsLocal().find((q) => q.id === id)
}

export function deleteQuotation(id: string): void {
  const existing = getQuotationsLocal().filter((q) => q.id !== id)
  setQuotationsLocal(existing)
  firestoreDelete("cotizaciones", id).catch(console.error)
}

export function updateQuotationStatus(id: string, status: QuotationData["status"]): void {
  const existing = getQuotationsLocal()
  const idx = existing.findIndex((q) => q.id === id)
  if (idx >= 0) {
    existing[idx]!.status = status
    setQuotationsLocal(existing)
    firestoreSetField("cotizaciones", id, { status }).catch(console.error)
  }
}

// ─── Catálogo ─────────────────────────────────────────────────

export function getCatalog(): CatalogItem[] {
  if (typeof window === "undefined") return DEFAULT_CATALOG
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    const parsed: CatalogItem[] = raw ? JSON.parse(raw) : []
    const normalizedSaved = parsed.map((item) => ({
      ...item,
      brand: item.brand || "Generico",
      subcategory: item.subcategory || "General",
      variant: item.variant || "",
      imageUrl: item.imageUrl || "",
    }))
    const mergedByCode = new Map<string, CatalogItem>()
    for (const item of DEFAULT_CATALOG) {
      mergedByCode.set(item.code.trim().toLowerCase(), {
        ...item,
        brand: item.brand || "Generico",
        subcategory: item.subcategory || "General",
        variant: item.variant || "",
        imageUrl: item.imageUrl || "",
      })
    }
    for (const item of normalizedSaved) {
      const codeKey = item.code.trim().toLowerCase()
      const defaultItem = mergedByCode.get(codeKey)
      mergedByCode.set(codeKey, {
        ...defaultItem,
        ...item,
        imageUrl: item.imageUrl || defaultItem?.imageUrl || "",
      })
    }
    return Array.from(mergedByCode.values())
  } catch {
    return DEFAULT_CATALOG
  }
}

export function saveCatalog(items: CatalogItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(items))
    // Solo sincronizar items personalizados (no los del DEFAULT_CATALOG)
    const customItems = items.filter(
      (i) => !DEFAULT_CATALOG.some((d) => d.code.trim().toLowerCase() === i.code.trim().toLowerCase()),
    )
    Promise.all(customItems.map((item) => firestoreSave("catalogo-custom", item))).catch(console.error)
    emitCatalogUpdated()
  }
}

export function addCatalogItem(item: CatalogItem): void {
  const catalog = getCatalog()
  catalog.push({ ...item, brand: item.brand || "Generico", subcategory: item.subcategory || "General", variant: item.variant || "", imageUrl: item.imageUrl || "" })
  saveCatalog(catalog)
}

export function updateCatalogItem(item: CatalogItem): void {
  const catalog = getCatalog()
  const idx = catalog.findIndex((c) => c.id === item.id)
  if (idx >= 0) {
    catalog[idx] = { ...item, brand: item.brand || "Generico", subcategory: item.subcategory || "General", variant: item.variant || "", imageUrl: item.imageUrl || "" }
    saveCatalog(catalog)
  }
}

export function deleteCatalogItem(id: string): void {
  const catalog = getCatalog().filter((c) => c.id !== id)
  saveCatalog(catalog)
  firestoreDelete("catalogo-custom", id).catch(console.error)
}

// ─── Config de descuento ──────────────────────────────────────

export function getCatalogDiscountConfig(): CatalogDiscountConfig {
  const fallback: CatalogDiscountConfig = { enabled: false, mode: "percentage", value: 0, scope: "all", category: "", subcategory: "" }
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(CATALOG_DISCOUNT_KEY)
    if (!raw) return fallback
    return { ...fallback, ...(JSON.parse(raw) as Partial<CatalogDiscountConfig>) }
  } catch {
    return fallback
  }
}

export function saveCatalogDiscountConfig(config: CatalogDiscountConfig): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATALOG_DISCOUNT_KEY, JSON.stringify(config))
    firestoreSetField("catalogo-config", "discount", config as unknown as Record<string, unknown>).catch(console.error)
    emitCatalogUpdated()
  }
}
