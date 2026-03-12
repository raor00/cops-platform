"use client"

import {
  Calendar,
  Download,
  Printer,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { PaymentScheduleReport } from "@/types"
import { cn } from "@/lib/utils"
import { downloadCSV } from "@/lib/utils/csv-export"

interface CuadroPagosProps {
  report: PaymentScheduleReport
}

function fmt(value: number) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function CuadroPagos({ report }: CuadroPagosProps) {
  function handlePrint() {
    window.print()
  }

  function handleExportCSV() {
    const rows: string[][] = [
      [
        "Tecnico",
        "Fecha Fin",
        "N Ticket",
        "Cliente",
        "Empresa",
        "Descripcion",
        "Monto Serv.",
        "Comision %",
        "A Pagar",
        "Estado",
        "Metodo",
        "Referencia",
      ],
    ]

    for (const technician of report.tecnicos) {
      for (const row of technician.rows) {
        rows.push([
          technician.tecnico_nombre,
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

      rows.push([
        "",
        "",
        "",
        "",
        "",
        "SUBTOTAL",
        fmt(technician.subtotal_servicio),
        "",
        fmt(technician.subtotal_comision),
        "",
        "",
        "",
      ])
      rows.push([])
    }

    rows.push([
      "",
      "",
      "",
      "",
      "",
      "TOTAL GENERAL",
      fmt(report.total_servicio),
      "",
      fmt(report.total_comision),
      "",
      "",
      "",
    ])

    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const filename = `cuadro-pagos-${new Date(report.periodo_desde).toISOString().slice(0, 7)}.csv`
    downloadCSV(csv, filename)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="page-header print:hidden">
        <div>
          <h1 className="page-title">Cuadro de Solicitudes de Pago</h1>
          <p className="page-description">
            Periodo: {fmtDate(report.periodo_desde)} - {fmtDate(report.periodo_hasta)}
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

      <div className="mb-6 hidden print:block">
        <h1 className="text-2xl font-bold text-black">COPS Electronics - Cuadro de Solicitudes de Pago</h1>
        <p className="mt-1 text-sm text-gray-600">
          Periodo: {fmtDate(report.periodo_desde)} al {fmtDate(report.periodo_hasta)} | Generado:{" "}
          {fmtDate(report.generado_en)} por {report.generado_por}
        </p>
        <div className="mt-3 flex gap-8 border-y border-gray-300 py-2 text-sm">
          <span>
            <strong>Total Servicios:</strong> ${fmt(report.total_servicio)}
          </span>
          <span>
            <strong>Total Comisiones:</strong> ${fmt(report.total_comision)}
          </span>
          <span className="text-yellow-700">
            <strong>Pendiente a Cancelar:</strong> ${fmt(report.total_pendiente)}
          </span>
          <span className="text-green-700">
            <strong>Cancelado:</strong> ${fmt(report.total_pagado)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 print:grid-cols-4 md:grid-cols-4">
        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <p className="text-xs text-slate-500 print:text-gray-500">Total Servicios</p>
          <p className="text-xl font-bold text-slate-900 print:text-black">${fmt(report.total_servicio)}</p>
        </Card>

        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <p className="text-xs text-slate-500 print:text-gray-500">Total Comisiones</p>
          <p className="text-xl font-bold text-sky-600 print:text-blue-700">${fmt(report.total_comision)}</p>
        </Card>

        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <p className="text-xs text-slate-500 print:text-gray-500">Pagado</p>
          </div>
          <p className="text-xl font-bold text-green-600 print:text-green-700">${fmt(report.total_pagado)}</p>
        </Card>

        <Card variant="glass" className="p-4 print:border print:border-gray-200 print:bg-white print:shadow-none">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
            <p className="text-xs text-slate-500 print:text-gray-500">Pendiente</p>
          </div>
          <p className="text-xl font-bold text-amber-600 print:text-yellow-700">${fmt(report.total_pendiente)}</p>
        </Card>
      </div>

      {report.tecnicos.length === 0 && (
        <Card variant="glass" className="p-12 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">No hay servicios finalizados en el periodo seleccionado.</p>
        </Card>
      )}

      {report.tecnicos.map((technician) => (
        <div key={technician.tecnico_id} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-sky-500" />
              <h2 className="font-semibold text-slate-900 print:text-black">{technician.tecnico_nombre}</h2>
              <span className="text-xs text-slate-500 print:text-gray-500">
                {technician.rows.length} servicio{technician.rows.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-600 print:text-gray-600">
                Pendiente:{" "}
                <span className="font-medium text-amber-600 print:text-yellow-700">${fmt(technician.pendientes)}</span>
              </span>
              <span className="text-slate-600 print:text-gray-600">
                Pagado:{" "}
                <span className="font-medium text-green-600 print:text-green-700">${fmt(technician.pagados)}</span>
              </span>
            </div>
          </div>

          <Card variant="glass" className="overflow-hidden print:rounded-none print:border print:border-gray-300 print:bg-white print:shadow-none">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 print:border-gray-300">
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 print:text-gray-600">Fecha</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 print:text-gray-600">N Ticket</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 print:text-gray-600">Cliente</th>
                  <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-slate-500 print:table-cell print:text-gray-600 md:table-cell">
                    Descripcion
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 print:text-gray-600">Monto</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 print:text-gray-600">Comis.%</th>
                  <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-500 print:text-gray-600">A Pagar</th>
                  <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-500 print:text-gray-600">Estado</th>
                </tr>
              </thead>

              <tbody>
                {technician.rows.map((row, index) => (
                  <tr key={index} className="border-b border-slate-100 print:border-gray-200">
                    <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600 print:text-gray-700">
                      {fmtDate(row.fecha_finalizacion)}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600 print:text-gray-700">
                      {row.ticket_numero}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-xs font-medium text-slate-800 print:text-gray-800">{row.cliente_nombre}</div>
                      {row.cliente_empresa && (
                        <div className="text-xs text-slate-500 print:text-gray-500">{row.cliente_empresa}</div>
                      )}
                    </td>
                    <td className="hidden max-w-[200px] truncate px-3 py-2.5 text-xs text-slate-600 print:table-cell print:text-gray-600 md:table-cell">
                      {row.descripcion}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs text-slate-800 print:text-gray-800">
                      ${fmt(row.monto_servicio)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-xs text-slate-600 print:text-gray-600">
                      {row.porcentaje_comision}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold text-slate-900 print:text-black">
                      ${fmt(row.monto_a_pagar)}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] print:rounded print:border",
                          row.estado_pago === "pagado"
                            ? "border-green-200 bg-green-50 text-green-700 print:border-green-300 print:bg-green-50 print:text-green-700"
                            : "border-amber-200 bg-amber-50 text-amber-700 print:border-yellow-300 print:bg-yellow-50 print:text-yellow-700"
                        )}
                      >
                        {row.estado_pago === "pagado" ? "Pagado" : "Pendiente"}
                      </Badge>
                    </td>
                  </tr>
                ))}

                <tr className="border-t border-slate-200 bg-slate-50 print:border-gray-400 print:bg-gray-50">
                  <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 print:text-gray-700">
                    Subtotal
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-xs font-semibold text-slate-900 print:text-black">
                    ${fmt(technician.subtotal_servicio)}
                  </td>
                  <td />
                  <td className="px-3 py-2.5 text-right font-mono text-xs font-bold text-sky-600 print:text-blue-700">
                    ${fmt(technician.subtotal_comision)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      ))}

      {report.tecnicos.length > 0 && (
        <Card variant="glass" className="p-4 print:border print:border-gray-400 print:bg-gray-100 print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-bold text-slate-900 print:text-black">TOTAL GENERAL</span>
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="text-slate-600 print:text-gray-600">
                Servicios: <span className="font-semibold text-slate-900 print:text-black">${fmt(report.total_servicio)}</span>
              </span>
              <span className="text-slate-600 print:text-gray-600">
                Comisiones: <span className="font-bold text-sky-600 print:text-blue-700">${fmt(report.total_comision)}</span>
              </span>
              <span className="text-slate-600 print:text-gray-600">
                Pendiente: <span className="font-bold text-amber-600 print:text-yellow-700">${fmt(report.total_pendiente)}</span>
              </span>
              <span className="text-slate-600 print:text-gray-600">
                Pagado: <span className="font-bold text-green-600 print:text-green-700">${fmt(report.total_pagado)}</span>
              </span>
            </div>
          </div>
        </Card>
      )}

      <div className="mt-8 hidden border-t pt-4 text-xs text-gray-500 print:block">
        Generado el {fmtDate(report.generado_en)} por {report.generado_por} - COPS Electronics
      </div>
    </div>
  )
}
