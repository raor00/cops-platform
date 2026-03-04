import { ZodError } from "zod"
import type { AIDraftRequest, AIDraftResponseWithoutMeta } from "@/lib/quotation-ai-types"
import { coerceAIDraftResponse } from "@/lib/quotation-ai-coerce"
import { AIResponseInvalidError } from "@/lib/ai/ai-errors"

interface OllamaOptions {
  baseUrl: string
  model: string
  timeoutMs: number
}

function candidateBaseUrls(baseUrlRaw: string): string[] {
  const base = (baseUrlRaw || "").replace(/\/$/, "")
  try {
    const u = new URL(base)
    const port = u.port || (u.protocol === "https:" ? "443" : "80")
    const list: string[] = [base]

    // Ollama on Windows/WSL often binds only to IPv6 loopback (::1). Make local dev resilient.
    if (u.hostname === "localhost") {
      list.push(`${u.protocol}//[::1]:${port}`)
      list.push(`${u.protocol}//127.0.0.1:${port}`)
    } else if (u.hostname === "127.0.0.1") {
      list.push(`${u.protocol}//localhost:${port}`)
      list.push(`${u.protocol}//[::1]:${port}`)
    } else if (u.hostname === "::1") {
      list.push(`${u.protocol}//localhost:${port}`)
      list.push(`${u.protocol}//127.0.0.1:${port}`)
    }

    return Array.from(new Set(list))
  } catch {
    return [base]
  }
}

function isUnreachableError(err: unknown): boolean {
  return err instanceof Error && String(err.message || "").startsWith("ollama_unreachable:")
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("ollama_timeout")), timeoutMs)
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

function extractJson(content: string): unknown {
  // Strip Qwen3/thinking-mode blocks: <think>...</think> before parsing
  const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()

  // Attempt 1: direct parse of cleaned string
  try {
    return JSON.parse(cleaned)
  } catch {
    // continue
  }

  // Attempt 2: scan brace depth to extract the outermost JSON object
  // (handles cases where the model adds text before/after the JSON)
  const start = cleaned.indexOf("{")
  if (start !== -1) {
    let depth = 0
    let end = -1
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === "{") depth++
      else if (cleaned[i] === "}") {
        depth--
        if (depth === 0) { end = i; break }
      }
    }
    if (end !== -1) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        // continue
      }
    }
  }

  throw new Error("ollama_invalid_json")
}

function describeFetchError(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  const anyErr = err as any
  const cause = anyErr?.cause
  const code = cause?.code || anyErr?.code
  const address = cause?.address || anyErr?.address
  const port = cause?.port || anyErr?.port
  const extra = [code, address && port ? `${address}:${port}` : address].filter(Boolean).join(" ")
  return extra ? `${err.message} (${extra})` : err.message
}

export function buildOllamaPrompt(input: AIDraftRequest, compactCatalog: unknown[]): string {
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
    "Eres COPIBOT, asistente de cotizaciones para COPS.",
    "Devuelve SOLO JSON valido, sin markdown, sin texto extra.",
    "Si un item no esta en catalogo, no lo confirmes: agregalo en suggestedItemsOutsideCatalog con reason.",
    "No inventes precios para items confirmados, usa unitPrice del catalogo.",
    "Regla de negocio: todo lo relacionado con instalacion/configuracion/puesta en marcha/mantenimiento es mano de obra.",
    "Regla de negocio: cables, canaletas, bases, tuberias, conectores, racks e insumos son materiales.",
    "Mant\u00e9n el JSON corto: solo los items necesarios.",
    "Responde en este formato:",
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
    `Formato empresa: ${input.companyFormat}`,
    `Tipo: ${input.quotationType}`,
    `Idioma: ${input.language || "es"}`,
    `Contexto actual: ${JSON.stringify(input.currentDraft || {})}`,
    `Catalogo disponible (subset):\n${catalogLines}`,
    `Solicitud usuario: ${input.message}`,
  ].join("\n")
}

const tagsCache = new Map<string, { at: number; models: Set<string> }>()

async function getOllamaModels(baseUrl: string, timeoutMs: number): Promise<Set<string>> {
  const cacheKey = baseUrl.replace(/\/$/, "")
  const cached = tagsCache.get(cacheKey)
  const now = Date.now()
  if (cached && now - cached.at < 60_000) return cached.models

  let res: Response
  try {
    res = await withTimeout(fetch(`${cacheKey}/api/tags`, { method: "GET" }), Math.min(timeoutMs, 4000))
  } catch (e) {
    throw new Error(`ollama_unreachable: ${describeFetchError(e)}`)
  }
  if (!res.ok) return new Set()
  const payload = (await res.json()) as { models?: Array<{ name?: string }> }
  const names = new Set((payload.models || []).map((m) => m.name).filter(Boolean) as string[])
  tagsCache.set(cacheKey, { at: now, models: names })
  return names
}

function buildChatMessages(input: AIDraftRequest, compactCatalog: unknown[], knowledgeContext?: string[]) {
  const system = [
    "/no_think",
    "Eres COPIBOT, asistente de cotizaciones para COPS.",
    "Devuelve SOLO JSON valido, sin markdown, sin texto extra, sin bloques de razonamiento.",
    "Si un item no esta en catalogo, no lo confirmes: agregalo en suggestedItemsOutsideCatalog con reason.",
    "No inventes precios para items confirmados, usa unitPrice del catalogo.",
    "Regla de negocio: todo lo relacionado con instalacion/configuracion/puesta en marcha/mantenimiento es mano de obra.",
    "Regla de negocio: cables, canaletas, bases, tuberias, conectores, racks e insumos son materiales.",
    "Responde en este formato:",
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
  ].join("\n")

  const userParts = [
    `Formato empresa: ${input.companyFormat}`,
    `Tipo: ${input.quotationType}`,
    `Idioma: ${input.language || "es"}`,
    `Contexto actual: ${JSON.stringify(input.currentDraft || {})}`,
    `Catalogo disponible (subset): ${JSON.stringify(compactCatalog)}`,
    `Solicitud usuario: ${input.message}`,
  ]

  if (knowledgeContext && knowledgeContext.length > 0) {
    userParts.push(`Referencias internas (historico):\n${knowledgeContext.join("\n---\n")}`)
  }

  return {
    messages: [
      { role: "system", content: system },
      { role: "user", content: userParts.join("\n") },
    ],
  }
}

export async function generateWithOllama(
  input: AIDraftRequest,
  compactCatalog: unknown[],
  options: OllamaOptions,
  knowledgeContext?: string[],
): Promise<AIDraftResponseWithoutMeta> {
  const bases = candidateBaseUrls(options.baseUrl)
  let lastErr: unknown = null

  for (const baseUrl of bases) {
    try {
      const models = await getOllamaModels(baseUrl, options.timeoutMs)
      if (models.size > 0 && !models.has(options.model)) {
        throw new Error("ollama_model_not_found")
      }

      const chatUrl = `${baseUrl}/api/chat`
      const generateUrl = `${baseUrl}/api/generate`
      const prompt = buildOllamaPrompt(input, compactCatalog)
      const promptWithKnowledge = knowledgeContext && knowledgeContext.length > 0
        ? `${prompt}\n\nReferencias internas (historico):\n${knowledgeContext.join("\n---\n")}`
        : prompt
      const { messages } = buildChatMessages(input, compactCatalog, knowledgeContext)
      const startedAt = Date.now()
      let res: Response
      try {
        res = await withTimeout(
          fetch(chatUrl, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              model: options.model,
              messages,
              stream: false,
              format: "json",
              think: false,
              options: { temperature: 0.2, num_predict: 2500 },
            }),
          }),
          options.timeoutMs,
        )
      } catch (e) {
        throw new Error(`ollama_unreachable: ${describeFetchError(e)}`)
      }

      if (!res.ok) {
        // If /api/chat isn't available, fallback to /api/generate.
        if (res.status === 404) {
          let res2: Response
          try {
            res2 = await withTimeout(
              fetch(generateUrl, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  model: options.model,
                  prompt: promptWithKnowledge,
                  stream: false,
                  format: "json",
                  think: false,
                  options: { temperature: 0.2, num_predict: 2500 },
                }),
              }),
              options.timeoutMs,
            )
          } catch (e) {
            throw new Error(`ollama_unreachable: ${describeFetchError(e)}`)
          }
          if (!res2.ok) throw new Error(`ollama_http_${res2.status}`)
          const payload2 = (await res2.json()) as { response?: string }
          if (!payload2.response) throw new Error("ollama_empty_response")
          const parsed2 = extractJson(payload2.response)
          try {
            const { coerced, warnings } = coerceAIDraftResponse(parsed2)
            return { ...coerced, warnings: [...warnings, ...coerced.warnings] }
          } catch (e) {
            if (e instanceof ZodError) throw new AIResponseInvalidError("ollama", e.flatten())
            throw e
          }
        }
        throw new Error(`ollama_http_${res.status}`)
      }

      const payload = (await res.json()) as { response?: string; message?: { content?: string } }
      const content = payload.message?.content || payload.response
      if (!content) throw new Error("ollama_empty_response")

      const parsed = extractJson(content)
      let validated: AIDraftResponseWithoutMeta
      try {
        const { coerced, warnings } = coerceAIDraftResponse(parsed)
        validated = { ...coerced, warnings: [...warnings, ...coerced.warnings] }
      } catch (e) {
        if (e instanceof ZodError) throw new AIResponseInvalidError("ollama", e.flatten())
        throw e
      }
      if (Date.now() - startedAt > options.timeoutMs + 100) {
        throw new Error("ollama_timeout")
      }
      return validated
    } catch (e) {
      lastErr = e
      if (isUnreachableError(e)) continue
      throw e
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("ollama_unreachable: unknown")
}
