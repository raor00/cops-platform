import { NextRequest, NextResponse } from "next/server"
import { ZodError } from "zod"
import { aiDraftRequestSchema } from "@/lib/quotation-ai-types"
import { generateQuoteDraft } from "@/lib/ai/generate-quote-draft"
import { isAIResponseInvalidError } from "@/lib/ai/ai-errors"

export const runtime = "nodejs"

function sanitizeOllamaBaseUrl(value: string | null): string | undefined {
  if (!value) return undefined
  const normalized = value.trim().replace(/\/$/, "")
  if (!normalized) return undefined
  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return undefined
  }
}

function sanitizeOllamaModel(value: string | null): string | undefined {
  const normalized = (value || "").trim()
  return normalized || undefined
}

const ipRequests = new Map<string, number[]>()

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip") || "unknown"
}

function checkRateLimit(ip: string, maxPerMinute: number): boolean {
  const now = Date.now()
  const oneMinuteAgo = now - 60_000
  const timestamps = (ipRequests.get(ip) || []).filter((t) => t >= oneMinuteAgo)
  timestamps.push(now)
  ipRequests.set(ip, timestamps)
  return timestamps.length <= maxPerMinute
}

export async function POST(req: NextRequest) {
  let input: unknown

  try {
    const body = await req.json()
    input = aiDraftRequestSchema.parse(body)
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "invalid_request", message: "Payload invalido", details: err.flatten() },
        { status: 400 },
      )
    }
    return NextResponse.json(
      { error: "invalid_json", message: "No se pudo leer el JSON del request." },
      { status: 400 },
    )
  }

  const maxPerMinute = Number(process.env.AI_RATE_LIMIT_PER_MIN || 20)
  const ip = getClientIp(req)
  if (!checkRateLimit(ip, maxPerMinute)) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", message: "Demasiadas solicitudes. Intenta en un minuto." },
      { status: 429 },
    )
  }

  try {
    const modeHeader = (req.headers.get("x-ai-provider-mode") || "").toLowerCase()
    const mode =
      modeHeader === "ollama" || modeHeader === "gemini" || modeHeader === "hybrid"
        ? (modeHeader as "ollama" | "gemini" | "hybrid")
        : undefined
    const disableFallback = (req.headers.get("x-ai-disable-fallback") || "").toLowerCase() === "true"
    const ollamaBaseUrl = sanitizeOllamaBaseUrl(req.headers.get("x-ollama-base-url"))
    const ollamaModel = sanitizeOllamaModel(req.headers.get("x-ollama-model"))

    const result = await generateQuoteDraft(input as any, { mode, disableFallback, ollamaBaseUrl, ollamaModel })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (isAIResponseInvalidError(err)) {
      return NextResponse.json(
        {
          error: "invalid_ai_response",
          message: "Respuesta IA invalida (JSON no coincide con el esquema).",
          provider: err.provider,
          details: err.details,
        },
        { status: 502 },
      )
    }

    const msg = err instanceof Error ? err.message : "unknown_error"
    if (msg === "ollama_timeout") {
      return NextResponse.json(
        { error: "provider_timeout", provider: "ollama", message: "Ollama excedio el tiempo de espera. Sube OLLAMA_TIMEOUT_MS o prueba un modelo mas pequeno." },
        { status: 504 },
      )
    }
    if (msg === "gemini_timeout") {
      return NextResponse.json(
        { error: "provider_timeout", provider: "gemini", message: "Gemini excedio el tiempo de espera. Sube GEMINI_TIMEOUT_MS o intenta de nuevo." },
        { status: 504 },
      )
    }
    if (msg.includes("timeout")) {
      return NextResponse.json(
        { error: "provider_timeout", message: "El proveedor IA excedio el tiempo de espera." },
        { status: 504 },
      )
    }
    if (msg === "ollama_model_not_found") {
      return NextResponse.json(
        { error: "model_not_found", message: "Modelo no encontrado en Ollama. Ejecuta 'ollama pull <modelo>'." },
        { status: 502 },
      )
    }
    if (msg.startsWith("ollama_unreachable")) {
      return NextResponse.json(
        { error: "provider_unreachable", provider: "ollama", message: "No se pudo conectar a Ollama. Verifica OLLAMA_BASE_URL, Tailscale/VPN y el servicio de Ollama.", details: msg },
        { status: 502 },
      )
    }
    if (msg === "no_ai_provider_available") {
      return NextResponse.json(
        { error: "provider_unavailable", message: "No hay proveedor IA configurado." },
        { status: 502 },
      )
    }

    return NextResponse.json(
      { error: "provider_error", message: "No se pudo generar el borrador con IA." },
      { status: 502 },
    )
  }
}
