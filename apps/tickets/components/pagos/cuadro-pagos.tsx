"use client"

import { Printer, Download, Calendar, User, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { PaymentScheduleReport } from "@/types"
import { cn } from "@/lib/utils"
import { downloadCSV } from "@/lib/utils/csv-export"

interface CuadroPagosProps {
  report: PaymentScheduleReport
}

function fmt(n: number) {
  return new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-VE", { day: "2-digit", month: "short", year: "numeric" })
}

export function CuadroPagos({ report }: CuadroPagosProps) {
  function handlePrint() {
    window.print()
  }

  function handleExportCSV() {
    const rows: string[][] = [
      ["Técnico", "Fecha Fin", "N° Ticket", "Cliente", "Empresa", "Descripción", "Monto Serv.", "Comisión %", "A Pagar", "Estado", "Método", "Referencia"],
    ]
    for (const tec of report.tecnicos) {
      for (const row of tec.rows) {
        rows.push([
          tec.tecnico_nombre,
          fmtDate(row.fecha_finalizacion),
          row.ticket_numero,
          row.cliente_nombre,
          row.cliente_empresa ?? "",
          row.descripcion,
          fmt(row.monto_servicio),
          String(row.porcentaje_comision),
          fmt(row.monto_a_pagar),
          row.estado_pago === "pagado" ? "Pagado" : "Pendiente",
          row.metodo_pago ?? "",
          row.referencia_pago ?? "",
        ])
      }
      rows.push(["", "", "", "", "", "SUBTOTAL", fmt(tec.subtotal_servicio), "", fmt(tec.subtotal_comision), "", "", ""])
      rows.push([])
    }
    rows.push(["", "", "", "", "", "TOTAL GENERAL", fmt(report.total_servicio), "", fmt(report.total_comision), "", "", ""])

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const filename = `cuadro-pagos-${new Date(report.periodo_desde).toISOString().slice(0, 7)}.csv`
    downloadCSV(csv, filename)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header — print-hidden */}
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title">Cuadro de Pagos</h1>
          <p className="page-description">
            Período: {fmtDate(report.periodo_desde)} — {fmtDate(report.periodo_hasta)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-black">COPS Electronics — Cuadro de Pagos</h1>
        <p className="text-sm text-gray-600">
          Período: {fmtDate(report.periodo_desde)} al {fmtDate(report.periodo_hasta)} |
          Generado: {fmtDate(report.generado_en)} por {report.generado_por}
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <p className="text-xs text-white/50 print:text-gray-500">Total Servicios</p>
          <p className="text-xl font-bold text-white print:text-black">${fmt(report.total_servicio)}</p>
        </Card>
        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <p className="text-xs text-white/50 print:text-gray-500">Total Comisiones</p>
          <p className="text-xl font-bold text-sky-400 print:text-blue-700">${fmt(report.total_comision)}</p>
        </Card>
        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            <p className="text-xs text-white/50 print:text-gray-500">Pagado</p>
          </div>
          <p className="text-xl font-bold text-green-400 print:text-green-700">${fmt(report.total_pagado)}</p>
        </Card>
        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-yellow-400" />
            <p className="text-xs text-white/50 print:text-gray-500">Pendiente</p>
          </div>
          <p className="text-xl font-bold text-yellow-400 print:text-yellow-700">${fmt(report.total_pendiente)}</p>
        </Card>
      </div>

      {/* Empty state */}
      {report.tecnicos.length === 0 && (
        <Card variant="glass" className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-white/20" />
          <p className="text-white/60">No hay servicios finalizados en el período seleccionado.</p>
        </Card>
      )}

      {/* Per-technician tables */}
      {report.tecnicos.map((tec) => (
        <div key={tec.tecnico_id} className="space-y-3">
          {/* Technician header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-sky-400" />
              <h2 className="font-semibold text-white print:text-black">{tec.tecnico_nombre}</h2>
              <span className="text-xs text-white/40 print:text-gray-500">
                {tec.rows.length} servicio{tec.rows.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-white/60 print:text-gray-600">
                Pendiente: <span className="text-yellow-400 font-medium print:text-yellow-700">${fmt(tec.pendientes)}</span>
              </span>
              <span className="text-white/60 print:text-gray-600">
                Pagado: <span className="text-green-400 font-medium print:text-green-700">${fmt(tec.pagados)}</span>
              </span>
            </div>
          </div>

          <Card variant="glass" className="overflow-hidden print:border print:border-gray-300 print:rounded-none print:shadow-none print:bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 print:border-gray-300">
                  <th className="text-left px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">Fecha</th>
                  <th className="text-left px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">N° Ticket</th>
                  <th className="text-left px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">Cliente</th>
                  <th className="text-left px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs hidden md:table-cell">Descripción</th>
                  <th className="text-right px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">Monto</th>
                  <th className="text-right px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">Comis.%</th>
                  <th className="text-right px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">A Pagar</th>
                  <th className="text-left px-3 py-2.5 text-white/50 font-medium print:text-gray-600 text-xs">Estado</th>
                </tr>
              </thead>
              <tbody>
                {tec.rows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 print:border-gray-200">
                    <td className="px-3 py-2.5 text-white/70 print:text-gray-700 text-xs whitespace-nowrap">
                      {fmtDate(row.fecha_finalizacion)}
                    </td>
                    <td className="px-3 py-2.5 text-white/70 print:text-gray-700 font-mono text-xs">
                      {row.ticket_numero}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-white/80 print:text-gray-800 text-xs font-medium">{row.cliente_nombre}</div>
                      {row.cliente_empresa && (
                        <div className="text-white/40 print:text-gray-500 text-xs">{row.cliente_empresa}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-white/60 print:text-gray-600 text-xs hidden md:table-cell max-w-[200px] truncate">
                      {row.descripcion}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/80 print:text-gray-800 text-xs font-mono">
                      ${fmt(row.monto_servicio)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-white/60 print:text-gray-600 text-xs">
                      {row.porcentaje_comision}%
                    </td>
                    <td className="px-3 py-2.5 text-right text-white font-semibold print:text-black text-xs font-mono">
                      ${fmt(row.monto_a_pagar)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] print:border print:rounded",
                          row.estado_pago === "pagado"
                            ? "bg-green-500/15 text-green-400 border-green-500/30 print:bg-green-50 print:text-green-700 print:border-green-300"
                            : "bg-yellow-500/15 text-yellow-400 border-yellow-500/30 print:bg-yellow-50 print:text-yellow-700 print:border-yellow-300"
                        )}
                      >
                        {row.estado_pago === "pagado" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {/* Subtotals */}
                <tr className="border-t border-white/15 bg-white/5 print:border-gray-400 print:bg-gray-50">
                  <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-semibold text-white/70 print:text-gray-700">
                    Subtotal
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-semibold text-white print:text-black font-mono">
                    ${fmt(tec.subtotal_servicio)}
                  </td>
                  <td />
                  <td className="px-3 py-2.5 text-right text-xs font-bold text-sky-400 print:text-blue-700 font-mono">
                    ${fmt(tec.subtotal_comision)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      ))}

      {/* Grand total */}
      {report.tecnicos.length > 0 && (
        <Card variant="glass" className="p-4 print:border print:border-gray-400 print:bg-gray-100 print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-bold text-white print:text-black">TOTAL GENERAL</span>
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="text-white/60 print:text-gray-600">
                Servicios: <span className="text-white font-semibold print:text-black">${fmt(report.total_servicio)}</span>
              </span>
              <span className="text-white/60 print:text-gray-600">
                Comisiones: <span className="text-sky-400 font-bold print:text-blue-700">${fmt(report.total_comision)}</span>
              </span>
              <span className="text-white/60 print:text-gray-600">
                Pendiente: <span className="text-yellow-400 font-bold print:text-yellow-700">${fmt(report.total_pendiente)}</span>
              </span>
              <span className="text-white/60 print:text-gray-600">
                Pagado: <span className="text-green-400 font-bold print:text-green-700">${fmt(report.total_pagado)}</span>
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Print footer */}
      <div className="hidden print:block mt-8 text-xs text-gray-500 border-t pt-4">
        Generado el {fmtDate(report.generado_en)} por {report.generado_por} — COPS Electronics
      </div>
    </div>
  )
}
