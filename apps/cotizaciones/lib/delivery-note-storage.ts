import type { DeliveryNoteData } from "./delivery-note-types"

const DELIVERY_NOTES_KEY = "cops_delivery_notes"

export function saveDeliveryNote(data: DeliveryNoteData): void {
  const existing = getDeliveryNotes()
  const idx = existing.findIndex((note) => note.id === data.id)

  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx].createdAt }
  } else {
    existing.unshift(data)
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(DELIVERY_NOTES_KEY, JSON.stringify(existing))
  }
}

export function getDeliveryNotes(): DeliveryNoteData[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(DELIVERY_NOTES_KEY)
    return raw ? (JSON.parse(raw) as DeliveryNoteData[]) : []
  } catch {
    return []
  }
}

export function deleteDeliveryNote(id: string): void {
  const existing = getDeliveryNotes().filter((note) => note.id !== id)

  if (typeof window !== "undefined") {
    localStorage.setItem(DELIVERY_NOTES_KEY, JSON.stringify(existing))
  }
}

