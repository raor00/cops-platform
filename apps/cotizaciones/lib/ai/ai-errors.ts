import type { AIProvider } from "@/lib/quotation-ai-types"

export class AIResponseInvalidError extends Error {
  provider: AIProvider
  details: unknown

  constructor(provider: AIProvider, details: unknown, message = "ai_response_invalid") {
    super(message)
    this.name = "AIResponseInvalidError"
    this.provider = provider
    this.details = details
  }
}

export function isAIResponseInvalidError(err: unknown): err is AIResponseInvalidError {
  return Boolean(err) && err instanceof Error && err.name === "AIResponseInvalidError"
}

