import type { DeliveryNoteData } from "./delivery-note-types"
import { firestoreSave, firestoreDelete } from "./firebase/firestore-storage"

const DELIVERY_NOTES_KEY = "cops_delivery_notes"

function getLocal(): DeliveryNoteData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(DELIVERY_NOTES_KEY)
    return raw ? (JSON.parse(raw) as DeliveryNoteData[]) : []
  } catch {
    return []
  }
}

function setLocal(data: DeliveryNoteData[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DELIVERY_NOTES_KEY, JSON.stringify(data))
  }
}

export function saveDeliveryNote(data: DeliveryNoteData): void {
  const existing = getLocal()
  const idx = existing.findIndex((note) => note.id === data.id)
  let toSave: DeliveryNoteData
  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx]!.createdAt }
    toSave = existing[idx]!
  } else {
    existing.unshift(data)
    toSave = data
  }
  setLocal(existing)
  firestoreSave("notas-entrega", toSave).catch(console.error)
}

export function getDeliveryNotes(): DeliveryNoteData[] {
  return getLocal()
}

export function deleteDeliveryNote(id: string): void {
  const existing = getLocal().filter((note) => note.id !== id)
  setLocal(existing)
  firestoreDelete("notas-entrega", id).catch(console.error)
}
