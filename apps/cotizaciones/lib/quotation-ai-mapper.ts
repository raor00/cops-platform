import type { CatalogItem, LaborItem, QuotationItem } from "./quotation-types"
import type { AIDraftLineItem, AIDraftPatch, AISuggestedItem } from "./quotation-ai-types"

const TOKEN_SPLIT = /[^a-z0-9]+/i

function stripDiacritics(value: string): string {
  // Keep ASCII output to make keyword matching resilient to accents (instalacion vs instalaci\u00f3n).
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function normalizeText(value: string): string {
  return stripDiacritics(value).toLowerCase()
}

function textTokens(value: string): string[] {
  return normalizeText(value)
    .split(TOKEN_SPLIT)
    .map((t) => t.trim())
    .filter((t) => t.length > 1)
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a)
  const setB = new Set(b)
  let inter = 0
  for (const tok of setA) {
    if (setB.has(tok)) inter += 1
  }
  const union = new Set([...setA, ...setB]).size
  return union ? inter / union : 0
}

function normalizeCode(code?: string): string {
  return (code || "").trim().toLowerCase()
}

function safeNumber(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

type CatalogLike = Pick<CatalogItem, "code" | "description" | "unitPrice" | "category" | "brand" | "subcategory">

function findCatalogMatch(item: AIDraftLineItem, catalog: CatalogLike[]): CatalogLike | null {
  const byCode = normalizeCode(item.code)
  if (byCode) {
    const exact = catalog.find((c) => normalizeCode(c.code) === byCode)
    if (exact) return exact
  }

  const itemTokens = textTokens(`${item.description} ${item.code || ""}`)
  let best: CatalogLike | null = null
  let bestScore = 0

  for (const c of catalog) {
    const score = jaccard(itemTokens, textTokens(`${c.code} ${c.description}`))
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }

  return bestScore >= 0.45 ? best : null
}

function normalizeLineItem(item: AIDraftLineItem): AIDraftLineItem {
  return {
    ...item,
    quantity: Math.max(1, safeNumber(item.quantity, 1)),
    unitPrice: item.unitPrice !== undefined ? Math.max(0, safeNumber(item.unitPrice, 0)) : undefined,
    description: item.description.trim(),
    code: item.code?.trim(),
  }
}

function normalizeDate(value?: string): string | undefined {
  if (!value) return undefined
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return undefined
  return d.toISOString().slice(0, 10)
}

const MATERIAL_KEYWORDS = [
  "cable", "cables", "canaleta", "canaletas", "base", "bases", "tuberia", "tuberias",
  "tubo", "tubos", "conector", "conectores", "jack", "patch", "faceplate", "rack",
  "gabinete", "abrazadera", "amarras", "bobina", "insumo", "materiales",
]

const LABOR_KEYWORDS = [
  "instalacion", "instalar", "configuracion", "configurar", "programacion", "puesta en marcha",
  "mano de obra", "servicio tecnico", "mantenimiento", "levantamiento", "comisionado",
  "calibracion", "soporte tecnico", "implementacion",
]

function matchesKeywords(item: Pick<AIDraftLineItem, "description" | "code">, keywords: string[]): boolean {
  const haystack = normalizeText(`${item.description} ${item.code || ""}`)
  return keywords.some((k) => haystack.includes(k))
}

export function isLikelyLaborItem(item: Pick<AIDraftLineItem, "description" | "code">): boolean {
  return matchesKeywords(item, LABOR_KEYWORDS)
}

export function isLikelyMaterialItem(item: Pick<AIDraftLineItem, "description" | "code">): boolean {
  return matchesKeywords(item, MATERIAL_KEYWORDS)
}

function laborDescriptionFromLineItem(item: AIDraftLineItem): string {
  const raw = item.description.trim()
  const lower = normalizeText(raw)
  if (lower.startsWith("mano de obra")) return raw
  if (lower.startsWith("servicio de")) return raw
  return `Mano de obra para ${raw}`
}

export function reclassifyDraftByBusinessRules(patch: AIDraftPatch): AIDraftPatch {
  const equipmentItems = [...(patch.equipmentItems || [])]
  const materialItems = [...(patch.materialItems || [])]
  const laborItems = [...(patch.laborItems || [])]

  const pushLaborFromLine = (line: AIDraftLineItem) => {
    const quantity = Math.max(1, safeNumber(line.quantity, 1))
    const unitPrice = Math.max(0, safeNumber(line.unitPrice, 0))
    laborItems.push({
      description: laborDescriptionFromLineItem(line),
      cost: Number((quantity * unitPrice).toFixed(2)),
    })
  }

  const nextEquipment: AIDraftLineItem[] = []
  for (const item of equipmentItems) {
    if (isLikelyMaterialItem(item)) {
      materialItems.push(item)
      continue
    }
    if (isLikelyLaborItem(item)) {
      pushLaborFromLine(item)
      continue
    }
    nextEquipment.push(item)
  }

  const nextMaterials: AIDraftLineItem[] = []
  for (const item of materialItems) {
    if (isLikelyLaborItem(item)) {
      pushLaborFromLine(item)
      continue
    }
    nextMaterials.push(item)
  }

  return {
    ...patch,
    equipmentItems: nextEquipment,
    materialItems: nextMaterials,
    laborItems,
  }
}

export function normalizeAIDraftPatch(patch: AIDraftPatch): AIDraftPatch {
  const normalized: AIDraftPatch = {
    ...patch,
    subject: patch.subject?.trim(),
    notes: patch.notes?.trim(),
    termsAndConditions: patch.termsAndConditions?.trim(),
    issueDate: normalizeDate(patch.issueDate),
    validUntil: normalizeDate(patch.validUntil),
    discountValue: patch.discountValue !== undefined ? Math.max(0, safeNumber(patch.discountValue, 0)) : undefined,
    equipmentItems: patch.equipmentItems?.map(normalizeLineItem).filter((x) => x.description.length > 0),
    materialItems: patch.materialItems?.map(normalizeLineItem).filter((x) => x.description.length > 0),
    laborItems: patch.laborItems?.map((l) => ({
      description: laborDescriptionFromLineItem({ description: l.description.trim(), quantity: 1 }),
      cost: Math.max(0, safeNumber(l.cost, 0)),
    })).filter((x) => x.description.length > 0),
  }
  return reclassifyDraftByBusinessRules(normalized)
}

export function resolveCatalogItems(
  items: AIDraftLineItem[] | undefined,
  catalog: CatalogLike[],
): { confirmed: AIDraftLineItem[]; suggested: AISuggestedItem[] } {
  if (!items || items.length === 0) {
    return { confirmed: [], suggested: [] }
  }

  const confirmed: AIDraftLineItem[] = []
  const suggested: AISuggestedItem[] = []

  for (const raw of items) {
    const item = normalizeLineItem(raw)
    const match = findCatalogMatch(item, catalog)
    if (!match) {
      suggested.push({
        ...item,
        reason: "No encontrado en catalogo local",
      })
      continue
    }
    confirmed.push({
      code: match.code,
      description: match.description,
      quantity: item.quantity,
      unitPrice: match.unitPrice,
      category: match.category,
      brand: match.brand || "Generico",
      subcategory: match.subcategory || "General",
    })
  }

  return { confirmed, suggested }
}

export function toQuotationItems(items: AIDraftLineItem[] | undefined): QuotationItem[] {
  if (!items) return []
  return items.map((item) => {
    const quantity = Math.max(1, safeNumber(item.quantity, 1))
    const unitPrice = Math.max(0, safeNumber(item.unitPrice, 0))
    return {
      id: makeId(),
      quantity,
      code: (item.code || "").trim(),
      description: item.description.trim(),
      unitPrice,
      totalPrice: Number((quantity * unitPrice).toFixed(2)),
      category: item.category,
      brand: item.brand,
      subcategory: item.subcategory,
      variant: "",
    }
  })
}

export function toLaborItems(items: Array<{ description: string; cost: number }> | undefined): LaborItem[] {
  if (!items) return []
  return items.map((item) => ({
    id: makeId(),
    description: item.description.trim(),
    cost: Math.max(0, safeNumber(item.cost, 0)),
  }))
}
