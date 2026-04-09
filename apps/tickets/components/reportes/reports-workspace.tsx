"use client"

import { useMemo, useState } from "react"
import { Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { downloadCSV } from "@/lib/utils/csv-export"
import { formatDateTimeExactVE, formatMinutesAndHours, formatMinutesToDuration } from "@/lib/utils"
import type { DetailedTicketReportRow, ReportColumnKey, ReportsSummary } from "@/types"

const COLUMN_LABELS: Record<ReportColumnKey, string> = {
  numero_ticket: "Ticket",
  asunto: "Asunto",
  cliente: "Cliente",
  agencia: "Sede / Agencia",
  tecnico: "Técnico",
  tipo: "Tipo",
  estado: "Estado",
  prioridad: "Prioridad",
  fecha_creacion: "Creado",
  fecha_servicio: "Servicio",
  fecha_llegada: "Llegada",
  fecha_inicio: "Inicio",
  fecha_finalizacion: "Finalización",
  cupones: "Cupones",
  horas_trabajadas: "Horas trabajadas",
  tiempo_total_minutos: "Tiempo total",
}

const DEFAULT_COLUMNS: ReportColumnKey[] = [
  "numero_ticket",
  "cliente",
  "agencia",
  "tecnico",
  "tipo",
  "estado",
  "fecha_servicio",
  "cupones",
  "horas_trabajadas",
  "tiempo_total_minutos",
]

function formatCellValue(key: ReportColumnKey, value: DetailedTicketReportRow[ReportColumnKey]) {
  if (["fecha_creacion", "fecha_servicio", "fecha_llegada", "fecha_inicio", "fecha_finalizacion"].includes(key)) {
    return value ? formatDateTimeExactVE(String(value)) : "—"
  }
  if (key === "tipo") {
    const labelMap: Record<string, string> = {
      servicio: "Servicio",
      proyecto: "Proyecto",
      inspeccion: "Inspección",
    }
    return labelMap[String(value)] || String(value || "—")
  }
  if (key === "estado") {
    const labelMap: Record<string, string> = {
      asignado: "Asignado",
      iniciado: "Iniciado",
      en_progreso: "En progreso",
      finalizado: "Finalizado",
      cancelado: "Cancelado",
      borrador: "Borrador",
    }
    return labelMap[String(value)] || String(value || "—")
  }
  if (key === "prioridad") {
    const labelMap: Record<string, string> = {
      baja: "Baja",
      media: "Media",
      alta: "Alta",
      urgente: "Urgente",
    }
    return labelMap[String(value)] || String(value || "—")
  }
  if (key === "horas_trabajadas") return Number(value) > 0 ? `${value} h` : "—"
  if (key === "tiempo_total_minutos") return Number(value) > 0 ? `${formatMinutesToDuration(Number(value))} (${value} min)` : "—"
  return String(value || "—")
}

export function ReportsWorkspace({ reports }: { reports: ReportsSummary }) {
  const [selectedColumns, setSelectedColumns] = useState<ReportColumnKey[]>(DEFAULT_COLUMNS)
  const [sortKey, setSortKey] = useState<ReportColumnKey>("fecha_servicio")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const sortedRows = useMemo(() => {
    const rows = [...reports.ticketRows]
    rows.sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      const result = typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left || "").localeCompare(String(right || ""))
      return sortDirection === "asc" ? result : -result
    })
    return rows
  }, [reports.ticketRows, sortDirection, sortKey])

  function toggleColumn(column: ReportColumnKey) {
    setSelectedColumns((prev) => prev.includes(column) ? prev.filter((item) => item !== column) : [...prev, column])
  }

  function handleSort(column: ReportColumnKey) {
    if (sortKey === column) {
      setSortDirection((prev) => prev === "asc" ? "desc" : "asc")
      return
    }
    setSortKey(column)
    setSortDirection("asc")
  }

  function handleExportCsv() {
    const headers = selectedColumns.map((column) => COLUMN_LABELS[column])
    const rows = sortedRows.map((row) => selectedColumns.map((column) => JSON.stringify(formatCellValue(column, row[column]))))
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    downloadCSV(csv, `reporte-detallado-${new Date().toISOString().split("T")[0]}.csv`)
  }

  function buildPrintableHtml() {
    return `
      <html><head><title>Reporte operativo</title><style>
        body{font-family:Arial,sans-serif;padding:24px;color:#0f172a} h1,h2{margin:0 0 12px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px;vertical-align:top} .meta{margin:12px 0 20px;color:#475569;font-size:12px} .cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px}.card{border:1px solid #cbd5e1;border-radius:12px;padding:12px;min-width:140px}
      </style></head><body>
        <h1>Reporte operativo</h1>
        <div class="meta">Preset: ${reports.filters.preset || "general"} · Mes: ${reports.filters.month || "Todos"} · Cliente: ${reports.filters.client || "Todos"} · Sede/Agencia: ${reports.filters.agency || "Todas"} · Técnico: ${reports.filters.technician || "Todos"}</div>
        <div class="cards">
          <div class="card"><strong>Tickets</strong><div>${reports.totalTickets}</div></div>
          <div class="card"><strong>Finalizados</strong><div>${reports.totalFinalizados}</div></div>
          <div class="card"><strong>Cupones</strong><div>${reports.totalCupones}</div></div>
          <div class="card"><strong>Horas</strong><div>${reports.totalHoras}</div></div>
        </div>
        <h2>Detalle ticket por ticket</h2>
        <table><thead><tr>${selectedColumns.map((column) => `<th>${COLUMN_LABELS[column]}</th>`).join("")}</tr></thead><tbody>
          ${sortedRows.map((row) => `<tr>${selectedColumns.map((column) => `<td>${formatCellValue(column, row[column])}</td>`).join("")}</tr>`).join("")}
        </tbody></table>
      </body></html>`
  }

  function handleExportPdf() {
    const printWindow = window.open("", "_blank", "width=1200,height=900")
    if (!printWindow) return
    printWindow.document.write(buildPrintableHtml())
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  function handlePrintBancaribeMonthly() {
    const printWindow = window.open("", "_blank", "width=1200,height=900")
    if (!printWindow) return
    const rows = reports.bancaribeRows
    const html = `
      <html><head><title>Bancaribe mensual</title><style>
        body{font-family:Arial,sans-serif;padding:24px;color:#0f172a} h1,h2{margin:0 0 12px} table{width:100%;border-collapse:collapse;margin-top:12px} th,td{border:1px solid #cbd5e1;padding:8px;text-align:left;font-size:12px} .meta{margin:12px 0 20px;color:#475569;font-size:12px}
      </style></head><body>
        <h1>Reporte mensual Bancaribe</h1>
        <div class="meta">Mes: ${reports.filters.month || "Todos"} · Cliente: Bancaribe</div>
        <h2>Resumen por sede/agencia</h2>
        <table><thead><tr><th>Agencia</th><th>Tickets</th><th>Servicios</th><th>Finalizados</th><th>Cupones</th><th>Horas</th></tr></thead><tbody>
          ${rows.map((row) => `<tr><td>${row.agencia}</td><td>${row.tickets}</td><td>${row.servicios}</td><td>${row.finalizados}</td><td>${row.cupones}</td><td>${row.horasTrabajadas}</td></tr>`).join("") || '<tr><td colspan="6">Sin datos</td></tr>'}
        </tbody></table>
      </body></html>`
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Detalle ticket por ticket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2"><Download className="h-4 w-4" />Exportar CSV detallado</Button>
            <Button variant="outline" size="sm" onClick={handleExportPdf} className="gap-2"><Download className="h-4 w-4" />Exportar PDF detallado</Button>
            <Button variant="outline" size="sm" onClick={handlePrintBancaribeMonthly} className="gap-2"><Printer className="h-4 w-4" />Imprimir Bancaribe mensual</Button>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Columnas visibles y exportables</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(COLUMN_LABELS) as ReportColumnKey[]).map((column) => (
                <label key={column} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => toggleColumn(column)}
                  />
                  <span>{COLUMN_LABELS[column]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  {selectedColumns.map((column) => (
                    <th key={column} className="px-3 py-2">
                      <button type="button" onClick={() => handleSort(column)} className="flex items-center gap-1 font-semibold">
                        {COLUMN_LABELS[column]}
                        {sortKey === column ? (sortDirection === "asc" ? "↑" : "↓") : null}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedRows.length === 0 ? (
                  <tr><td className="px-3 py-4 text-slate-500" colSpan={selectedColumns.length}>No hay tickets para los filtros seleccionados.</td></tr>
                ) : sortedRows.map((row) => (
                  <tr key={row.numero_ticket} className="border-b border-slate-100 text-slate-700">
                    {selectedColumns.map((column) => (
                      <td key={column} className="px-3 py-2">{formatCellValue(column, row[column])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
