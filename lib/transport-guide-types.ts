export interface TransportGuideItem {
  id: string
  description: string
  quantity: number
}

export interface TransportGuideData {
  id: string
  code: string
  issueDate: string
  recipient: string
  authorizedName: string
  authorizedIdentification: string
  vehicleDescription: string
  origin: string
  destination: string
  companyName: string
  companyRif: string
  contacts: string
  signName: string
  signIdentification: string
  signTitle: string
  subject: string
  items: TransportGuideItem[]
  bodyText: string
  extraNotes: string
  createdAt: string
  status: "borrador" | "emitida" | "anulada"
}

export function generateTransportGuideCode(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 90000) + 10000
  return `GT-${random}-${year}`
}

