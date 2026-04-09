export interface ClientAIConfig {
  baseUrl: string
  model: string
  providerMode: "hybrid" | "ollama" | "gemini"
  disableFallback: boolean
}

export const DEFAULT_CLIENT_AI_CONFIG: ClientAIConfig = {
  baseUrl: "",
  model: "qwen3.5:2b",
  providerMode: "ollama",
  disableFallback: true,
}

const STORAGE_KEY = "cops_cotizaciones_ai_runtime"

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/$/, "")
}

export function sanitizeClientAIConfig(input: Partial<ClientAIConfig> | null | undefined): ClientAIConfig {
  return {
    baseUrl: normalizeBaseUrl(input?.baseUrl || ""),
    model: (input?.model || DEFAULT_CLIENT_AI_CONFIG.model).trim() || DEFAULT_CLIENT_AI_CONFIG.model,
    providerMode:
      input?.providerMode === "hybrid" || input?.providerMode === "gemini" || input?.providerMode === "ollama"
        ? input.providerMode
        : DEFAULT_CLIENT_AI_CONFIG.providerMode,
    disableFallback: typeof input?.disableFallback === "boolean"
      ? input.disableFallback
      : DEFAULT_CLIENT_AI_CONFIG.disableFallback,
  }
}

export function getClientAIConfig(): ClientAIConfig {
  if (typeof window === "undefined") return DEFAULT_CLIENT_AI_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CLIENT_AI_CONFIG
    return sanitizeClientAIConfig(JSON.parse(raw) as Partial<ClientAIConfig>)
  } catch {
    return DEFAULT_CLIENT_AI_CONFIG
  }
}

export function saveClientAIConfig(config: Partial<ClientAIConfig>): ClientAIConfig {
  const next = sanitizeClientAIConfig(config)
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export function buildAIRequestHeaders(config: ClientAIConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "x-ai-provider-mode": config.providerMode,
    "x-ai-disable-fallback": String(config.disableFallback),
  }

  if (config.baseUrl) headers["x-ollama-base-url"] = normalizeBaseUrl(config.baseUrl)
  if (config.model) headers["x-ollama-model"] = config.model.trim()
  return headers
}
