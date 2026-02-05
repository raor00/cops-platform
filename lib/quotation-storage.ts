import type { QuotationData, CatalogItem } from "./quotation-types"
import { DEFAULT_CATALOG } from "./quotation-types"

const QUOTATIONS_KEY = "cops_quotations"
const CATALOG_KEY = "cops_catalog"

export function saveQuotation(data: QuotationData): void {
  const existing = getQuotations()
  const idx = existing.findIndex((q) => q.id === data.id)
  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx].createdAt }
  } else {
    existing.unshift(data)
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(existing))
  }
}

export function getQuotations(): QuotationData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(QUOTATIONS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function getQuotationById(id: string): QuotationData | undefined {
  return getQuotations().find((q) => q.id === id)
}

export function deleteQuotation(id: string): void {
  const existing = getQuotations().filter((q) => q.id !== id)
  if (typeof window !== "undefined") {
    localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(existing))
  }
}

export function updateQuotationStatus(id: string, status: QuotationData["status"]): void {
  const existing = getQuotations()
  const idx = existing.findIndex((q) => q.id === id)
  if (idx >= 0) {
    existing[idx].status = status
    if (typeof window !== "undefined") {
      localStorage.setItem(QUOTATIONS_KEY, JSON.stringify(existing))
    }
  }
}

export function getCatalog(): CatalogItem[] {
  if (typeof window === "undefined") return DEFAULT_CATALOG
  try {
    const raw = localStorage.getItem(CATALOG_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_CATALOG
  } catch {
    return DEFAULT_CATALOG
  }
}

export function saveCatalog(items: CatalogItem[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(items))
  }
}

export function addCatalogItem(item: CatalogItem): void {
  const catalog = getCatalog()
  catalog.push(item)
  saveCatalog(catalog)
}

export function updateCatalogItem(item: CatalogItem): void {
  const catalog = getCatalog()
  const idx = catalog.findIndex((c) => c.id === item.id)
  if (idx >= 0) {
    catalog[idx] = item
    saveCatalog(catalog)
  }
}

export function deleteCatalogItem(id: string): void {
  const catalog = getCatalog().filter((c) => c.id !== id)
  saveCatalog(catalog)
}
