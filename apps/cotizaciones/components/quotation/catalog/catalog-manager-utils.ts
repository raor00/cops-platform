import { normalizeCatalogCategory } from "./catalog-utils"
import type { CatalogItem } from "@/lib/quotation-types"
import type { CatalogSortOption } from "./catalog-toolbar"

const CATEGORY_ORDER = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
  "Materiales",
  "Automatizacion",
  "UPS Online 1-3kVA",
  "UPS Online 6-10kVA",
  "UPS Online",
  "UPS Trifasicos",
  "UPS Modulares",
  "UPS Interactivos",
  "Inversores Solares",
  "Almacenamiento Energia",
  "Cargadores Solares",
  "Baterias Externas",
  "Filtros Armonicos",
  "Reguladores/Proteccion",
  "Monitoreo Baterias",
  "Transferencias",
  "Accesorios",
  "Otros Ablerex",
]

export function getOrderedCategories(items: CatalogItem[]): Array<{ name: string; count: number }> {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    const category = normalizeCatalogCategory(item)
    counts.set(category, (counts.get(category) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a.name)
      const indexB = CATEGORY_ORDER.indexOf(b.name)
      return (indexA >= 0 ? indexA : Number.MAX_SAFE_INTEGER) - (indexB >= 0 ? indexB : Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name)
    })
}

export function getCatalogSubcategories(catalog: CatalogItem[], category?: string): string[] {
  const items = category ? catalog.filter((item) => normalizeCatalogCategory(item) === category) : catalog
  const subcategories = Array.from(new Set(items.map((item) => item.subcategory || "General"))).filter(Boolean)
  return subcategories.length > 0 ? subcategories.sort() : ["General"]
}

export function generateNextProductCode(catalog: CatalogItem[]): string {
  const regex = /^PROD-(\d+)$/i
  const numbers = catalog
    .map((item) => {
      const match = item.code.match(regex)
      return match ? Number.parseInt(match[1], 10) : 0
    })
    .filter((value) => value > 0)

  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1
  return `PROD-${String(next).padStart(3, "0")}`
}

export function mapListSortToToolbarSort(column: "code" | "description" | "category" | "brand" | "price", direction: "asc" | "desc"): CatalogSortOption | null {
  if (column === "price") return direction === "desc" ? "price-desc" : "price-asc"
  if (column === "code") return "code-asc"
  if (column === "description") return "description-asc"
  return null
}

export function getListSortState(sort: CatalogSortOption) {
  switch (sort) {
    case "price-asc":
      return { sortBy: "price" as const, direction: "asc" as const }
    case "price-desc":
      return { sortBy: "price" as const, direction: "desc" as const }
    case "description-asc":
      return { sortBy: "description" as const, direction: "asc" as const }
    case "code-asc":
    default:
      return { sortBy: "code" as const, direction: "asc" as const }
  }
}
