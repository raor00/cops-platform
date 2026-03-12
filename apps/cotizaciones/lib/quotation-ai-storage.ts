import type { AIGenerationMetadata } from "./quotation-ai-types"
import { firestoreSave } from "./firebase/firestore-storage"

const AI_EVENTS_KEY = "cops_ai_events"

export interface QuotationAIEvent {
  id: string
  timestamp: string
  action: "generate_quote_draft"
  success: boolean
  provider?: AIGenerationMetadata["provider"]
  model?: string
  fallbackUsed?: boolean
  latencyMs?: number
  warningCount?: number
  error?: string
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getAIEvents(): QuotationAIEvent[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(AI_EVENTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as QuotationAIEvent[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveAIEvent(event: Omit<QuotationAIEvent, "id" | "timestamp">): void {
  const next: QuotationAIEvent = {
    id: makeId(),
    timestamp: new Date().toISOString(),
    ...event,
  }
  if (typeof window !== "undefined") {
    const current = getAIEvents()
    current.unshift(next)
    localStorage.setItem(AI_EVENTS_KEY, JSON.stringify(current.slice(0, 200)))
  }
  // Log en Firestore (async, fire-and-forget)
  firestoreSave("ai-events", next).catch(console.error)
}
