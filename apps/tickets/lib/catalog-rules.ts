import type { CatalogEntry } from "@/lib/catalog-data"

export type CatalogSegment = "material" | "equipo"

type CatalogLike = Pick<CatalogEntry, "code" | "category" | "description">

function normalize(value: string): string {
  return value.trim().toUpperCase()
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function getCatalogSegment(entry: CatalogLike): CatalogSegment {
  const code = normalize(entry.code)
  const category = normalize(entry.category)
  const description = normalize(entry.description)

  // Regla fija: MAT-* y categoria Materiales siempre van a materiales.
  if (code.startsWith("MAT-") || category === "MATERIALES") {
    return "material"
  }

  // Regla fija: Energia, UPS y familia Ablerex power se clasifica como equipos.
  const isPowerItem =
    category === "ENERGIA" ||
    description.includes("UPS") ||
    description.includes("ABLEREX") ||
    description.includes("BATERIA") ||
    description.includes("INVERSOR")

  if (isPowerItem) {
    return "equipo"
  }

  return "equipo"
}

export function getCatalogIdentifier(entry: CatalogLike): string {
  const code = normalize(entry.code).replace(/\s+/g, "")
  if (code) {
    return `CAT-${code}`
  }

  const fallback = slugify(`${entry.category}-${entry.description}`) || "item"
  return `CAT-${fallback.toUpperCase()}`
}
