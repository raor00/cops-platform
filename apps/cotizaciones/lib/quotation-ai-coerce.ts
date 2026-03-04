import { aiDraftResponseSchema, type AIDraftResponseWithoutMeta } from "@/lib/quotation-ai-types"

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null) return {}
  return value as Record<string, unknown>
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return undefined
    const pct = trimmed.endsWith("%") ? trimmed.slice(0, -1) : trimmed
    const n = Number(pct)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function coerceConfidence(confidence: unknown, warnings: string[]): number | undefined {
  const n = toNumber(confidence)
  if (n === undefined) return undefined

  if (n > 1 && n <= 100) {
    warnings.push("confidence_normalized_from_percent")
    return Math.max(0, Math.min(1, n / 100))
  }

  if (n > 100) {
    warnings.push("confidence_clamped")
    return 1
  }

  return Math.max(0, Math.min(1, n))
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === "string") return value
  return undefined
}

function coerceLineItem(value: unknown, warnings: string[]) {
  if (typeof value === "string") {
    return { description: value, quantity: 1 }
  }

  const obj = asRecord(value)
  const description =
    coerceString(obj.description) ||
    coerceString(obj.name) ||
    coerceString(obj.item) ||
    coerceString(obj.title) ||
    "Item"

  const rawQty = toNumber(obj.quantity ?? obj.qty ?? obj.cant)
  const quantity = rawQty && rawQty > 0 ? rawQty : 1
  if (!rawQty || rawQty <= 0) warnings.push("quantity_defaulted_to_1")

  const unitPrice = toNumber(obj.unitPrice ?? obj.unit_price ?? obj.price)
  const out: Record<string, unknown> = {
    code: coerceString(obj.code),
    description,
    quantity,
  }
  if (unitPrice !== undefined && unitPrice >= 0) out.unitPrice = unitPrice

  const category = coerceString(obj.category)
  const brand = coerceString(obj.brand)
  const subcategory = coerceString(obj.subcategory)
  if (category) out.category = category
  if (brand) out.brand = brand
  if (subcategory) out.subcategory = subcategory
  return out
}

function coerceDiscountMode(value: unknown): "amount" | "percentage" | undefined {
  const s = coerceString(value)?.toLowerCase().trim()
  if (!s) return undefined
  if (s === "amount" || s === "monto" || s === "valor") return "amount"
  if (s === "percentage" || s === "percent" || s === "porcentaje" || s === "%") return "percentage"
  return undefined
}

function coerceClientInfo(value: unknown): Record<string, string> | undefined {
  const obj = asRecord(value)
  const allowed = [
    "name",
    "attention",
    "email",
    "rif",
    "phone",
    "address",
    "customerId",
    "billToName",
    "billToAttention",
    "billToEmail",
    "billToPhone",
    "billToAddress",
    "shipToName",
    "shipToAttention",
    "shipToEmail",
    "shipToPhone",
    "shipToAddress",
  ] as const

  const out: Record<string, string> = {}
  for (const k of allowed) {
    const v = obj[k]
    if (typeof v === "string") out[k] = v
    else if (v !== undefined && v !== null) out[k] = String(v)
  }
  return Object.keys(out).length > 0 ? out : undefined
}

function coerceLaborItem(value: unknown, warnings: string[]) {
  if (typeof value === "string") {
    return { description: value, cost: 0 }
  }
  const obj = asRecord(value)
  const description =
    coerceString(obj.description) ||
    coerceString(obj.name) ||
    coerceString(obj.title) ||
    "Mano de obra"

  const cost = toNumber(obj.cost)
  if (cost !== undefined && cost >= 0) {
    return { description, cost }
  }

  const hours = toNumber(obj.hours)
  const rate = toNumber(obj.rate)
  if (hours !== undefined && rate !== undefined && hours >= 0 && rate >= 0) {
    warnings.push("labor_cost_computed_from_hours_rate")
    return { description, cost: Number((hours * rate).toFixed(2)) }
  }

  warnings.push("labor_cost_defaulted_to_0")
  return { description, cost: 0 }
}

export function coerceAIDraftResponse(raw: unknown): { coerced: AIDraftResponseWithoutMeta; warnings: string[] } {
  const warnings: string[] = []
  const obj = asRecord(raw)

  const draftPatch = (obj.draftPatch ?? obj.draft_patch) as unknown
  const suggestedItemsOutsideCatalog = (obj.suggestedItemsOutsideCatalog ?? obj.suggested_items_outside_catalog) as unknown
  const confidence = coerceConfidence(obj.confidence, warnings)

  const patchObj = asRecord(draftPatch)
  const patch: Record<string, unknown> = {
    subject: coerceString(patchObj.subject),
    issueDate: coerceString(patchObj.issueDate ?? patchObj.issue_date),
    validUntil: coerceString(patchObj.validUntil ?? patchObj.valid_until),
    paymentCondition: coerceString(patchObj.paymentCondition ?? patchObj.payment_condition),
    notes: coerceString(patchObj.notes),
    termsAndConditions: coerceString(patchObj.termsAndConditions ?? patchObj.terms_and_conditions),
    discountMode: coerceDiscountMode(patchObj.discountMode ?? patchObj.discount_mode),
    discountValue: toNumber(patchObj.discountValue ?? patchObj.discount_value),
    clientInfo: coerceClientInfo(patchObj.clientInfo ?? patchObj.client_info),
  }

  const equipmentItemsRaw = patchObj.equipmentItems ?? patchObj.equipment_items
  const materialItemsRaw = patchObj.materialItems ?? patchObj.material_items
  const laborItemsRaw = patchObj.laborItems ?? patchObj.labor_items

  const equipmentItems = Array.isArray(equipmentItemsRaw) ? equipmentItemsRaw.map((x) => coerceLineItem(x, warnings)) : []
  const materialItems = Array.isArray(materialItemsRaw) ? materialItemsRaw.map((x) => coerceLineItem(x, warnings)) : []
  const laborItems = Array.isArray(laborItemsRaw) ? laborItemsRaw.map((x) => coerceLaborItem(x, warnings)) : []

  patch.equipmentItems = equipmentItems
  patch.materialItems = materialItems
  patch.laborItems = laborItems

  const suggested = Array.isArray(suggestedItemsOutsideCatalog)
    ? suggestedItemsOutsideCatalog.map((x) => {
        const item = asRecord(coerceLineItem(x, warnings))
        const reason = coerceString(asRecord(x).reason) || "No encontrado en catalogo"
        return { ...item, reason }
      })
    : []

  const output = {
    draftPatch: patch,
    suggestedItemsOutsideCatalog: suggested,
    warnings: Array.isArray(obj.warnings) ? (obj.warnings as unknown[]).map((w) => String(w)) : [],
    confidence: confidence ?? 0.6,
  }

  // Validate final shape strictly.
  const coerced = aiDraftResponseSchema.parse(output)
  return { coerced, warnings }
}
