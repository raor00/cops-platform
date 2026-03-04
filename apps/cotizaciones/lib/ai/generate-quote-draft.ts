import type { AIDraftRequest, AIDraftResponse, AIGenerationMetadata } from "@/lib/quotation-ai-types"
import { isLikelyLaborItem, normalizeAIDraftPatch, resolveCatalogItems } from "@/lib/quotation-ai-mapper"
import { generateWithGemini } from "./providers/gemini"
import { generateWithOllama } from "./providers/ollama"
import { redactKnowledgeForExternalProvider, retrieveKnowledgeContext } from "./knowledge/knowledge"

interface CompactCatalogItem {
  code: string
  description: string
  unitPrice: number
  category: string
  brand?: string
  subcategory?: string
}

function compactCatalogForPrompt(input: AIDraftRequest, maxItems = 150): CompactCatalogItem[] {
  const tokens = input.message.toLowerCase().split(/[^a-z0-9]+/i).filter((x) => x.length > 2)
  const scored = input.catalog.map((item) => {
    const searchable = `${item.code} ${item.description} ${item.category} ${item.brand || ""} ${item.subcategory || ""}`.toLowerCase()
    const score = tokens.reduce((sum, tok) => sum + (searchable.includes(tok) ? 1 : 0), 0)
    return { item, score }
  })
  scored.sort((a, b) => b.score - a.score)
  const selected = scored.slice(0, Math.min(maxItems, scored.length)).map((x) => x.item)
  const slice = selected.length > 0 ? selected : input.catalog.slice(0, Math.min(maxItems, input.catalog.length))
  return slice.map((x) => ({
    code: x.code,
    description: (x.description || "").slice(0, 140),
    unitPrice: x.unitPrice,
    category: x.category,
    brand: x.brand,
    subcategory: x.subcategory,
  }))
}

function buildMeta(provider: "ollama" | "gemini", model: string, latencyMs: number, fallbackUsed: boolean): AIGenerationMetadata {
  return { provider, model, latencyMs, fallbackUsed }
}

function promoteLaborSuggestionsToPatch(
  patch: NonNullable<ReturnType<typeof normalizeAIDraftPatch>>,
  suggestions: Array<{ code?: string; description: string; quantity: number; unitPrice?: number; reason: string }>,
) {
  const remaining: typeof suggestions = []
  const laborItems = [...(patch.laborItems || [])]

  for (const s of suggestions) {
    if (isLikelyLaborItem({ description: s.description, code: s.code })) {
      const qty = Math.max(1, Number(s.quantity || 1))
      const unit = Math.max(0, Number(s.unitPrice || 0))
      laborItems.push({
        description: `Mano de obra para ${s.description}`,
        cost: Number((qty * unit).toFixed(2)),
      })
      continue
    }
    remaining.push(s)
  }

  patch.laborItems = laborItems
  return remaining
}

export type AIProviderMode = "hybrid" | "ollama" | "gemini"

export interface GenerateQuoteDraftOptions {
  mode?: AIProviderMode
  disableFallback?: boolean
}

export async function generateQuoteDraft(input: AIDraftRequest, options?: GenerateQuoteDraftOptions): Promise<AIDraftResponse> {
  const mode: AIProviderMode = options?.mode || (process.env.AI_PROVIDER_MODE as AIProviderMode) || "hybrid"
  const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || ""
  const ollamaModel = process.env.OLLAMA_MODEL || "qwen3.5:2b"
  const ollamaTimeoutMs = Number(process.env.OLLAMA_TIMEOUT_MS || 120000)
  const geminiApiKey = process.env.GEMINI_API_KEY || ""
  const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const geminiTimeoutMs = Number(process.env.GEMINI_TIMEOUT_MS || 30000)
  const compactCatalog = compactCatalogForPrompt(input)
  const knowledgeEnabled = (process.env.AI_KNOWLEDGE_ENABLED || "false") === "true"

  const canUseOllama = Boolean(ollamaBaseUrl) && (mode === "hybrid" || mode === "ollama")
  const canUseGemini = Boolean(geminiApiKey) && (mode === "hybrid" || mode === "gemini")

  const started = Date.now()
  let usedFallback = false
  let providerError: string | null = null
  const knowledgeChunks = knowledgeEnabled ? await retrieveKnowledgeContext({ input, topK: 8 }).catch(() => []) : []

  if (canUseOllama) {
    try {
      const raw = await generateWithOllama(input, compactCatalog, {
        baseUrl: ollamaBaseUrl,
        model: ollamaModel,
        timeoutMs: ollamaTimeoutMs,
      }, knowledgeChunks)
      const patch = normalizeAIDraftPatch(raw.draftPatch)
      const eqResolved = resolveCatalogItems(patch.equipmentItems, input.catalog)
      const matResolved = resolveCatalogItems(patch.materialItems, input.catalog)
      let suggested = [
        ...eqResolved.suggested,
        ...matResolved.suggested,
        ...raw.suggestedItemsOutsideCatalog,
      ]
      suggested = promoteLaborSuggestionsToPatch(patch, suggested)
      return {
        draftPatch: {
          ...patch,
          equipmentItems: eqResolved.confirmed,
          materialItems: matResolved.confirmed,
        },
        suggestedItemsOutsideCatalog: suggested,
        warnings: raw.warnings,
        confidence: raw.confidence,
        metadata: buildMeta("ollama", ollamaModel, Date.now() - started, false),
      }
    } catch (err) {
      if (options?.disableFallback || mode === "ollama") throw err
      providerError = err instanceof Error ? err.message : "ollama_error"
      usedFallback = true
    }
  }

  if (canUseGemini) {
    const geminiStarted = Date.now()
    const knowledgeForGemini = knowledgeChunks.length > 0 ? redactKnowledgeForExternalProvider(knowledgeChunks) : []
    const raw = await generateWithGemini(input, compactCatalog, {
      apiKey: geminiApiKey,
      model: geminiModel,
      timeoutMs: geminiTimeoutMs,
    }, knowledgeForGemini)
    const patch = normalizeAIDraftPatch(raw.draftPatch)
    const eqResolved = resolveCatalogItems(patch.equipmentItems, input.catalog)
    const matResolved = resolveCatalogItems(patch.materialItems, input.catalog)
    let suggested = [
      ...eqResolved.suggested,
      ...matResolved.suggested,
      ...raw.suggestedItemsOutsideCatalog,
    ]
    suggested = promoteLaborSuggestionsToPatch(patch, suggested)
    return {
      draftPatch: {
        ...patch,
        equipmentItems: eqResolved.confirmed,
        materialItems: matResolved.confirmed,
      },
      suggestedItemsOutsideCatalog: suggested,
      warnings: providerError ? [`Fallback activado: ${providerError}`, ...raw.warnings] : raw.warnings,
      confidence: raw.confidence,
      metadata: buildMeta("gemini", geminiModel, Date.now() - geminiStarted, usedFallback),
    }
  }

  throw new Error("no_ai_provider_available")
}
