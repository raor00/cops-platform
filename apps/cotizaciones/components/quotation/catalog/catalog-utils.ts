import type { CatalogItem } from "@/lib/quotation-types"
import { Battery, Cable, Package, Zap, type LucideIcon } from "lucide-react"

/**
 * Normaliza la categoría principal del producto.
 * Los productos Ablerex se mueven a la categoría "Energía".
 */
export function normalizeCatalogCategory(item: CatalogItem): string {
  const brand = (item.brand || "General").toLowerCase()
  if (brand !== "ablerex") return item.category

  // Todos los productos Ablerex van bajo "Energía"
  return "Energia"
}

/**
 * Extrae la subcategoría específica para productos Ablerex.
 * Devuelve null para productos no-Ablerex (usan su propia subcategoría).
 */
export function normalizeAblerexSubcategory(item: CatalogItem): string | null {
  const brand = (item.brand || "General").toLowerCase()
  if (brand !== "ablerex") return null

  const category = item.category.toUpperCase()

  if (category.includes("BOLSILLO")) return "Reguladores/Proteccion"
  if (category.includes("REGULADOR") || category.includes("PROTECCION") || category.includes("SOBRETENSION")) {
    return "Reguladores/Proteccion"
  }
  if (category.includes("MONITOREO") || category.includes("ENERBATT")) return "Monitoreo Baterias"
  if (category.includes("ATS") || category.includes("ITS") || category.includes("TRANSFERENCIA")) return "Transferencias"
  if (category.includes("CARGADOR") || category.includes("BUCK")) return "Cargadores Solares"
  if (category.includes("INVERSOR") || category.includes("FOTOVOLTAIC")) {
    if (category.includes("HIBRID") || category.includes("HOGAR")) return "Almacenamiento Energia"
    return "Inversores Solares"
  }
  if (category.includes("ALMACEN") || category.includes("ENERSALVYS") || category.includes("ALMACENAMIENTO")) {
    return "Almacenamiento Energia"
  }
  if (category.includes("BANCO") || category.includes("BATERIA")) return "Baterias Externas"
  if (category.includes("ENERSINE") || category.includes("FILTRO")) return "Filtros Armonicos"
  if (category.includes("BRICM")) return "UPS Modulares"
  if (category.includes("INTERACTIV")) return "UPS Interactivos"
  if (category.includes("UPS ONLINE") || category.includes("DOBLE CONVERSION")) {
    if (category.includes("1-3KVA") || category.includes("1-3 KVA") || category.match(/1.*3KVA/) || category.match(/1.*3\s*KVA/)) {
      return "UPS Online 1-3kVA"
    }
    if (category.includes("6 - 10") || category.includes("6-10") || category.includes("6 -10")) {
      return "UPS Online 6-10kVA"
    }
    if (category.includes("TRIFAS") || category.includes("3F")) return "UPS Trifasicos"
    return "UPS Online"
  }
  if (category.includes("TRIFAS") || category.includes("3F")) return "UPS Trifasicos"
  if (category.includes("ACCESORIO")) return "Accesorios"
  if (category.includes("MODULAR")) return "UPS Modulares"

  return "Otros Ablerex"
}

/**
 * Devuelve la subcategoría a mostrar para un producto.
 * Para Ablerex: la subcategoría específica del tipo de producto.
 * Para otros: la subcategoría existente o "General".
 */
export function getProductSubcategory(item: CatalogItem): string {
  const ablerexSub = normalizeAblerexSubcategory(item)
  if (ablerexSub) return ablerexSub
  return item.subcategory || "General"
}

export function getCategoryIcon(category: string): LucideIcon {
  if (category.includes("Bateria") || category.includes("Almacen")) return Battery
  if (category === "Materiales" || category.includes("Cable")) return Cable
  if (category.includes("UPS") || category.includes("Energi") || category === "Energia") return Zap
  return Package
}

/**
 * Obtiene las subcategorías disponibles para una categoría dada.
 * Si es "Energia", incluye las subcategorías de Ablerex.
 */
export function getCategorySubcategories(
  catalog: CatalogItem[],
  category: string | null
): string[] {
  const items = category
    ? catalog.filter((item) => normalizeCatalogCategory(item) === category)
    : catalog

  const subs = new Set<string>()
  items.forEach((item) => {
    const sub = getProductSubcategory(item)
    if (sub && sub !== "General") {
      subs.add(sub)
    }
  })

  return Array.from(subs).sort()
}
