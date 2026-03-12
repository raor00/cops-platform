import type { TransportGuideData } from "./transport-guide-types"
import { firestoreSave, firestoreDelete } from "./firebase/firestore-storage"

const TRANSPORT_GUIDES_KEY = "cops_transport_guides"

function getLocal(): TransportGuideData[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(TRANSPORT_GUIDES_KEY)
    return raw ? (JSON.parse(raw) as TransportGuideData[]) : []
  } catch {
    return []
  }
}

function setLocal(data: TransportGuideData[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSPORT_GUIDES_KEY, JSON.stringify(data))
  }
}

export function saveTransportGuide(data: TransportGuideData): void {
  const existing = getLocal()
  const idx = existing.findIndex((guide) => guide.id === data.id)
  let toSave: TransportGuideData
  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx]!.createdAt }
    toSave = existing[idx]!
  } else {
    existing.unshift(data)
    toSave = data
  }
  setLocal(existing)
  firestoreSave("guias-transporte", toSave).catch(console.error)
}

export function getTransportGuides(): TransportGuideData[] {
  return getLocal()
}

export function deleteTransportGuide(id: string): void {
  const existing = getLocal().filter((guide) => guide.id !== id)
  setLocal(existing)
  firestoreDelete("guias-transporte", id).catch(console.error)
}
