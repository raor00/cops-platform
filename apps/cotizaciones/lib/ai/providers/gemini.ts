import { ZodError } from "zod"
import type { AIDraftRequest, AIDraftResponseWithoutMeta } from "@/lib/quotation-ai-types"
import { coerceAIDraftResponse } from "@/lib/quotation-ai-coerce"
import { AIResponseInvalidError } from "@/lib/ai/ai-errors"

interface GeminiOptions {
  apiKey: string
  model: string
  timeoutMs: number
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("gemini_timeout")), timeoutMs)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch((err) => {
        clearTimeout(t)
        reject(err)
      })
  })
}

function buildPrompt(input: AIDraftRequest, compactCatalog: unknown[]): string {
  const catalogLines = Array.isArray(compactCatalog)
    ? compactCatalog
        .slice(0, 180)
        .map((c) => {
          const o = c as any
          const code = String(o.code || "").trim()
          const cat = String(o.category || "").trim()
          const price = Number(o.unitPrice || 0)
          const desc = String(o.description || "").replace(/\s+/g, " ").trim()
          return `${code} | ${cat} | ${price} | ${desc}`
        })
        .filter((l) => l.length > 3)
        .join("\n")
    : ""

  return [
    "You are COPIBOT, a quotation draft assistant for COPS.",
    "Return only valid JSON. Do not use markdown or extra text.",
    "For confirmed items, only use provided catalog items and prices.",
    "If item is not found in catalog, include it in suggestedItemsOutsideCatalog with reason.",
    "Business rule: installation/configuration/commissioning/maintenance must be labor.",
    "Business rule: cables, conduits, canaletas, bases, connectors, racks and similar supplies must be materials.",
    "Keep the JSON short: only include needed items.",
    "Output JSON format:",
    JSON.stringify({
      draftPatch: {
        subject: "",
        issueDate: "",
        validUntil: "",
        paymentCondition: "",
        notes: "",
        termsAndConditions: "",
        discountMode: "amount",
        discountValue: 0,
        clientInfo: {},
        equipmentItems: [],
        materialItems: [],
        laborItems: [],
      },
      suggestedItemsOutsideCatalog: [],
      warnings: [],
      confidence: 0.8,
    }),
    `companyFormat=${input.companyFormat}`,
    `quotationType=${input.quotationType}`,
    `language=${input.language || "es"}`,
    `currentDraft=${JSON.stringify(input.currentDraft || {})}`,
    `catalogSubset=\n${catalogLines}`,
    `userRequest=${input.message}`,
  ].join("\n")
}

function extractText(payload: unknown): string {
  const maybe = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = maybe.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    throw new Error("gemini_empty_response")
  }
  return text
}

function extractJson(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}$/)
    if (!match) {
      throw new Error("gemini_invalid_json")
    }
    return JSON.parse(match[0])
  }
}

export async function generateWithGemini(
  input: AIDraftRequest,
  compactCatalog: unknown[],
  options: GeminiOptions,
  knowledgeContext?: string[],
): Promise<AIDraftResponseWithoutMeta> {
  const prompt = buildPrompt(input, compactCatalog)
  const knowledgeBlock = knowledgeContext && knowledgeContext.length > 0
    ? `\n\nINTERNAL REFERENCES (sanitized):\n${knowledgeContext.join("\n---\n")}`
    : ""
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent?key=${encodeURIComponent(options.apiKey)}`
  const res = await withTimeout(
    fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${prompt}${knowledgeBlock}` }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
    }),
    options.timeoutMs,
  )

  if (!res.ok) {
    throw new Error(`gemini_http_${res.status}`)
  }

  const payload = await res.json()
  const text = extractText(payload)
  const parsed = extractJson(text)
  try {
    const { coerced, warnings } = coerceAIDraftResponse(parsed)
    return { ...coerced, warnings: [...warnings, ...coerced.warnings] }
  } catch (err) {
    if (err instanceof ZodError) {
      throw new AIResponseInvalidError("gemini", err.flatten())
    }
    throw err
  }
}
