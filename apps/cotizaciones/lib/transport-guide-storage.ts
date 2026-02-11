import type { TransportGuideData } from "./transport-guide-types"

const TRANSPORT_GUIDES_KEY = "cops_transport_guides"

export function saveTransportGuide(data: TransportGuideData): void {
  const existing = getTransportGuides()
  const idx = existing.findIndex((guide) => guide.id === data.id)

  if (idx >= 0) {
    existing[idx] = { ...data, createdAt: existing[idx].createdAt }
  } else {
    existing.unshift(data)
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSPORT_GUIDES_KEY, JSON.stringify(existing))
  }
}

export function getTransportGuides(): TransportGuideData[] {
  if (typeof window === "undefined") return []

  try {
    const raw = localStorage.getItem(TRANSPORT_GUIDES_KEY)
    return raw ? (JSON.parse(raw) as TransportGuideData[]) : []
  } catch {
    return []
  }
}

export function deleteTransportGuide(id: string): void {
  const existing = getTransportGuides().filter((guide) => guide.id !== id)

  if (typeof window !== "undefined") {
    localStorage.setItem(TRANSPORT_GUIDES_KEY, JSON.stringify(existing))
  }
}

