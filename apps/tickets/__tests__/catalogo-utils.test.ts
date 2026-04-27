import { describe, expect, it } from "vitest"

import type { CatalogoProducto } from "@cops/shared"

import {
  buildStockAlertRows,
  findCatalogProductForMaterial,
} from "@/lib/catalogo-utils"

const productos: CatalogoProducto[] = [
  {
    id: "prod-1",
    code: "CAB-UTP-01",
    description: "Cable UTP Cat6 305m",
    unitPrice: 100,
    costo: 50,
    category: "Cableado",
    brand: "Genérico",
    subcategory: "UTP",
    variant: "Cat6",
    unit: "ROLLO",
    imageUrl: "",
    stock: 8,
    stockMinimo: 10,
    ubicacion: "A1",
    activo: true,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "prod-2",
    code: "TARJ-NVR-01",
    description: "Tarjeta NVR 16 canales",
    unitPrice: 60,
    costo: 30,
    category: "Grabadores",
    brand: "Genérico",
    subcategory: "NVR",
    variant: "16CH",
    unit: "UND",
    imageUrl: "",
    stock: 12,
    stockMinimo: 4,
    ubicacion: "B3",
    activo: true,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
  },
  {
    id: "prod-3",
    code: "CONE-RJ45-01",
    description: "Conector RJ45",
    unitPrice: 1,
    costo: 0.2,
    category: "Conectores",
    brand: "Genérico",
    subcategory: "RJ45",
    variant: "",
    unit: "UND",
    imageUrl: "",
    stock: 2,
    stockMinimo: 6,
    ubicacion: "C2",
    activo: true,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
  },
]

describe("findCatalogProductForMaterial", () => {
  it("prioriza producto_id cuando existe", () => {
    const result = findCatalogProductForMaterial(
      { producto_id: "prod-2", nombre: "Otro nombre" },
      productos,
    )

    expect(result.producto?.id).toBe("prod-2")
    expect(result.reason).toBe("producto_id")
  })

  it("encuentra coincidencias por código exacto ignorando mayúsculas", () => {
    const result = findCatalogProductForMaterial(
      { nombre: "cab-utp-01" },
      productos,
    )

    expect(result.producto?.id).toBe("prod-1")
    expect(result.reason).toBe("code")
  })

  it("encuentra coincidencias difusas por descripción", () => {
    const result = findCatalogProductForMaterial(
      { nombre: "cable utp cat6" },
      productos,
    )

    expect(result.producto?.id).toBe("prod-1")
    expect(result.reason).toBe("description")
  })

  it("reporta no encontrado cuando ningún producto coincide", () => {
    const result = findCatalogProductForMaterial(
      { nombre: "material inventado" },
      productos,
    )

    expect(result.producto).toBeUndefined()
    expect(result.reason).toBe("not_found")
  })
})

describe("buildStockAlertRows", () => {
  it("solo incluye productos por debajo del stock mínimo y calcula el faltante", () => {
    const rows = buildStockAlertRows(productos)

    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ producto_id: "prod-3", diferencia: 4 })
    expect(rows[1]).toMatchObject({ producto_id: "prod-1", diferencia: 2 })
  })
})
