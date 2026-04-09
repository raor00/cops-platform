import type { CatalogItem, LaborItem, QuotationItem, QuotationType } from "./quotation-types"

type SuggestionSource = "rule-engine"

export interface AutomationMeta {
  source: SuggestionSource
  generatedAt: string
  quotationType: QuotationType
  summary: string
}

export interface AutomationSuggestionResult {
  laborItems: LaborItem[]
  materialItems: QuotationItem[]
  meta: AutomationMeta
}

interface LaborRule {
  match: (item: QuotationItem) => boolean
  descriptionEs: string
  descriptionEn: string
  hoursPerUnit: number
}

interface MaterialRule {
  match: (item: QuotationItem) => boolean
  code: string
  descriptionIncludes?: string[]
  quantityFromItem: (item: QuotationItem) => number
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function includesAny(value: string, terms: string[]): boolean {
  const normalized = normalizeText(value)
  return terms.some((term) => normalized.includes(normalizeText(term)))
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

type CatalogLike = Pick<CatalogItem, "code" | "description" | "unitPrice" | "category" | "brand" | "subcategory" | "variant">

function catalogLookup(catalog: CatalogLike[]): Map<string, CatalogLike> {
  return new Map(catalog.map((item) => [item.code.trim().toLowerCase(), item]))
}

function toCatalogLike(item: QuotationItem | CatalogLike): CatalogLike {
  return {
    code: item.code,
    description: item.description,
    unitPrice: item.unitPrice,
    category: item.category || "General",
    brand: item.brand,
    subcategory: item.subcategory,
    variant: item.variant,
  }
}

function findCatalogItemByHints(catalog: CatalogLike[], code: string, hints?: string[]): CatalogLike | null {
  const byCode = catalog.find((item) => item.code.trim().toLowerCase() === code.trim().toLowerCase())
  if (byCode) return byCode
  if (!hints || hints.length === 0) return null
  return (
    catalog.find((item) => hints.every((hint) => normalizeText(item.description).includes(normalizeText(hint)))) ||
    null
  )
}

const laborRules: LaborRule[] = [
  {
    match: (item) => includesAny(`${item.code} ${item.description} ${item.category || ""}`, ["camara", "camera", "dome", "bullet", "ptz"]),
    descriptionEs: "Instalación, configuración y pruebas de cámaras",
    descriptionEn: "Camera installation, configuration and testing",
    hoursPerUnit: 1.2,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["nvr", "dvr", "video recorder"]),
    descriptionEs: "Instalación y configuración de grabador",
    descriptionEn: "Recorder installation and configuration",
    hoursPerUnit: 2.5,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description} ${item.category || ""}`, ["acceso", "access", "electroiman", "terminal", "huella"]),
    descriptionEs: "Instalación, cableado y programación de control de acceso",
    descriptionEn: "Access control installation, wiring and programming",
    hoursPerUnit: 2.8,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description} ${item.category || ""}`, ["alarma", "alarm", "panel", "sirena", "detector"]),
    descriptionEs: "Instalación y programación de sistema de alarma",
    descriptionEn: "Alarm system installation and programming",
    hoursPerUnit: 1.6,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description} ${item.category || ""}`, ["ups", "smart-ups", "bateria", "battery", "energia"]),
    descriptionEs: "Instalación y puesta en marcha de respaldo de energía",
    descriptionEn: "Power backup installation and commissioning",
    hoursPerUnit: 1.5,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description} ${item.category || ""}`, ["switch", "poe", "rack", "redes", "network"]),
    descriptionEs: "Instalación, configuración y pruebas de red",
    descriptionEn: "Network installation, configuration and testing",
    hoursPerUnit: 1.3,
  },
]

const materialRules: MaterialRule[] = [
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["camara", "camera", "dome", "bullet", "ptz"]),
    code: "MAT-UTP-CAT6-305",
    quantityFromItem: (item) => Math.max(1, Math.ceil(item.quantity / 8)),
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["camara", "camera", "dome", "bullet", "ptz"]),
    code: "MAT-RJ45-CAT6",
    quantityFromItem: (item) => Math.max(1, Math.ceil((item.quantity * 2) / 100)),
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["camara", "camera", "dome", "bullet"]),
    code: "MAT-SOPORTE-PARED",
    quantityFromItem: (item) => item.quantity,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["nvr", "dvr", "switch", "poe"]),
    code: "MAT-RACK-6U",
    quantityFromItem: () => 1,
  },
  {
    match: (item) => includesAny(`${item.code} ${item.description}`, ["electroiman", "terminal", "acceso", "access"]),
    code: "MAT-CABLE-ST-2X18",
    quantityFromItem: (item) => Math.max(20, item.quantity * 15),
  },
]

function getHourlyRate(type: QuotationType): number {
  switch (type) {
    case "servicio":
      return 18
    case "mantenimiento":
      return 16
    default:
      return 22
  }
}

function getComplexityFactor(type: QuotationType): number {
  switch (type) {
    case "servicio":
      return 1
    case "mantenimiento":
      return 0.85
    default:
      return 1.15
  }
}

function mergeLabor(existing: LaborItem[], suggested: LaborItem[]): LaborItem[] {
  const seen = new Set(existing.map((item) => normalizeText(item.description)))
  const next = [...existing]
  for (const item of suggested) {
    const key = normalizeText(item.description)
    if (!seen.has(key)) {
      seen.add(key)
      next.push(item)
    }
  }
  return next
}

function mergeMaterials(existing: QuotationItem[], suggested: QuotationItem[]): QuotationItem[] {
  const merged = [...existing]
  for (const item of suggested) {
    const idx = merged.findIndex((current) => current.code.trim().toLowerCase() === item.code.trim().toLowerCase())
    if (idx >= 0) {
      const current = merged[idx]!
      const qty = Number(current.quantity || 0) + Number(item.quantity || 0)
      merged[idx] = {
        ...current,
        quantity: qty,
        totalPrice: Number((qty * current.unitPrice).toFixed(2)),
      }
      continue
    }
    merged.push(item)
  }
  return merged
}

export function buildAutomationSuggestions(params: {
  equipmentItems: QuotationItem[]
  materialItems: QuotationItem[]
  laborItems: LaborItem[]
  quotationType: QuotationType
  companyFormat: "sa" | "llc"
  catalog: CatalogLike[]
}): AutomationSuggestionResult {
  const { equipmentItems, materialItems, laborItems, quotationType, companyFormat, catalog } = params
  const hourlyRate = getHourlyRate(quotationType)
  const complexityFactor = getComplexityFactor(quotationType)

  const suggestedLabor: LaborItem[] = []
  for (const equipment of equipmentItems) {
    const rule = laborRules.find((candidate) => candidate.match(equipment))
    if (!rule) continue
    const hours = Number((rule.hoursPerUnit * Math.max(1, equipment.quantity) * complexityFactor).toFixed(2))
    const cost = Number((hours * hourlyRate).toFixed(2))
    suggestedLabor.push({
      id: makeId("labor"),
      description: companyFormat === "llc"
        ? `${rule.descriptionEn} · ${equipment.description}`
        : `${rule.descriptionEs} · ${equipment.description}`,
      cost,
    })
  }

  const existingCatalog = catalogLookup([...equipmentItems, ...materialItems, ...catalog].map(toCatalogLike))
  const suggestedMaterials: QuotationItem[] = []
  for (const equipment of equipmentItems) {
    for (const rule of materialRules) {
      if (!rule.match(equipment)) continue
      const matched = existingCatalog.get(rule.code.trim().toLowerCase()) || findCatalogItemByHints(catalog, rule.code, rule.descriptionIncludes)
      if (!matched) continue
      const quantity = Math.max(1, rule.quantityFromItem(equipment))
      suggestedMaterials.push({
        id: makeId("mat"),
        code: matched.code,
        description: matched.description,
        quantity,
        unitPrice: matched.unitPrice,
        totalPrice: Number((quantity * matched.unitPrice).toFixed(2)),
        category: matched.category,
        brand: matched.brand,
        subcategory: matched.subcategory,
        variant: matched.variant,
      })
    }
  }

  return {
    laborItems: mergeLabor(laborItems, suggestedLabor),
    materialItems: mergeMaterials(materialItems, suggestedMaterials),
    meta: {
      source: "rule-engine",
      generatedAt: new Date().toISOString(),
      quotationType,
      summary: `Base ${hourlyRate.toFixed(2)} USD/h · factor ${complexityFactor.toFixed(2)}`,
    },
  }
}
