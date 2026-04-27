import type { CatalogoProducto } from "@cops/shared"

import type { MaterialItem } from "@/types"

export type CatalogMatchReason = "producto_id" | "code" | "description" | "not_found"

export interface CatalogProductMatch {
  producto?: CatalogoProducto
  reason: CatalogMatchReason
}

export interface StockAlertRow {
  producto_id: string
  codigo: string
  descripcion: string
  stockActual: number
  stockMinimo: number
  diferencia: number
}

export function normalizeCatalogText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase()
}

function isTokenSubset(query: string, target: string): boolean {
  if (!query || !target) return false

  const queryTokens = query.split(/\s+/).filter(Boolean)
  const targetTokens = target.split(/\s+/).filter(Boolean)

  return queryTokens.every((token) => targetTokens.some((targetToken) => targetToken.includes(token)))
}

export function findCatalogProductForMaterial(
  material: Pick<MaterialItem, "producto_id" | "nombre">,
  productos: CatalogoProducto[],
): CatalogProductMatch {
  const byId = material.producto_id?.trim()
  if (byId) {
    const producto = productos.find((item) => item.id === byId && item.activo)
    if (producto) return { producto, reason: "producto_id" }
  }

  const normalizedName = normalizeCatalogText(material.nombre)
  if (!normalizedName) return { reason: "not_found" }

  const exactCode = productos.find((item) => item.activo && normalizeCatalogText(item.code) === normalizedName)
  if (exactCode) return { producto: exactCode, reason: "code" }

  const descriptionMatch = productos.find((item) => {
    if (!item.activo) return false

    const normalizedDescription = normalizeCatalogText(item.description)
    return (
      normalizedDescription === normalizedName ||
      normalizedDescription.includes(normalizedName) ||
      normalizedName.includes(normalizedDescription) ||
      isTokenSubset(normalizedName, normalizedDescription)
    )
  })

  if (descriptionMatch) return { producto: descriptionMatch, reason: "description" }

  return { reason: "not_found" }
}

export function filterCatalogProductsByQuery(
  productos: CatalogoProducto[],
  query: string,
  excludeIds: string[] = [],
): CatalogoProducto[] {
  const normalizedQuery = normalizeCatalogText(query)
  const excluded = new Set(excludeIds)

  return productos
    .filter((producto) => producto.activo && !excluded.has(producto.id))
    .filter((producto) => {
      if (!normalizedQuery) return true

      const code = normalizeCatalogText(producto.code)
      const description = normalizeCatalogText(producto.description)

      return (
        code.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        isTokenSubset(normalizedQuery, description)
      )
    })
    .sort((a, b) => {
      const aCode = normalizeCatalogText(a.code)
      const bCode = normalizeCatalogText(b.code)
      const aDescription = normalizeCatalogText(a.description)
      const bDescription = normalizeCatalogText(b.description)

      const aScore = Number(aCode.startsWith(normalizedQuery)) * 4 + Number(aDescription.startsWith(normalizedQuery)) * 3 + Number(aDescription.includes(normalizedQuery))
      const bScore = Number(bCode.startsWith(normalizedQuery)) * 4 + Number(bDescription.startsWith(normalizedQuery)) * 3 + Number(bDescription.includes(normalizedQuery))

      if (aScore !== bScore) return bScore - aScore
      return a.code.localeCompare(b.code, "es", { sensitivity: "base" })
    })
}

export function buildStockAlertRows(productos: CatalogoProducto[]): StockAlertRow[] {
  return productos
    .filter((producto) => producto.activo && producto.stock < producto.stockMinimo)
    .map((producto) => ({
      producto_id: producto.id,
      codigo: producto.code,
      descripcion: producto.description,
      stockActual: producto.stock,
      stockMinimo: producto.stockMinimo,
      diferencia: Math.max(producto.stockMinimo - producto.stock, 0),
    }))
    .sort((a, b) => b.diferencia - a.diferencia || a.codigo.localeCompare(b.codigo, "es", { sensitivity: "base" }))
}
