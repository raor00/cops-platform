import type { TechnicianPayment } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

export interface PaymentExportData {
  numero_ticket: string
  asunto: string
  tecnico: string
  monto: number
  estado: string
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  referencia_pago: string | null
}

export function generatePaymentsCSV(payments: PaymentExportData[]): string {
  const headers = [
    "Ticket",
    "Asunto",
    "Técnico",
    "Monto",
    "Estado",
    "Fecha Habilitación",
    "Fecha Pago",
    "Método Pago",
    "Referencia",
  ]

  const rows = payments.map((payment) => [
    payment.numero_ticket,
    payment.asunto,
    payment.tecnico,
    formatCurrency(payment.monto),
    payment.estado,
    formatDate(payment.fecha_habilitacion),
    payment.fecha_pago ? formatDate(payment.fecha_pago) : "-",
    payment.metodo_pago || "-",
    payment.referencia_pago || "-",
  ])

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  return csvContent
}

export function downloadCSV(content: string, filename: string) {
  const blob = new Blob(["\ufeff" + content], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generatePaymentsFilename(prefix = "pagos"): string {
  const date = new Date()
  const dateString = date.toISOString().split("T")[0]
  return `${prefix}_${dateString}.csv`
}
