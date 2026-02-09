export interface DeliveryNoteItem {
  id: string
  code: string
  description: string
  quantity: number
}

export interface DeliveryNoteData {
  id: string
  code: string
  issueDate: string
  clientName: string
  attention: string
  clientIdentification: string
  receiverName: string
  receiverIdentification: string
  deliveredBy: string
  notes: string
  items: DeliveryNoteItem[]
  createdAt: string
  status: "borrador" | "entregada" | "anulada"
}

export function generateDeliveryNoteCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `NE-${random}-${year}`
}

