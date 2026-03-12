"use client"

import { useState } from "react"
import { Users, TrendingUp, CheckCircle2, Clock, DollarSign, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatMinutesToDuration } from "@/lib/utils"
import type { TechnicianKPI } from "@/types"
import { cn } from "@/lib/utils"

interface TechnicianStatsTableProps {
  kpis: TechnicianKPI[]
}

export function TechnicianStatsTable({ kpis }: TechnicianStatsTableProps) {
  const [selected, setSelected] = useState<TechnicianKPI | null>(null)

  if (kpis.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
        <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm text-slate-500">No hay datos de técnicos disponibles</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Técnico
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Completados
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                Activos
              </th>
              <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 md:table-cell">
                Tiempo Prom.
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">
                Monto Total
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 lg:table-cell">
                Pendiente
              </th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, i) => {
              const totalRate =
                kpi.ticketsCompletados + kpi.ticketsActivos > 0
                  ? Math.round(
                      (kpi.ticketsCompletados /
                        (kpi.ticketsCompletados + kpi.ticketsActivos)) *
                        100
                    )
                  : 0

              return (
                <tr
                  key={kpi.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
                    selected?.id === kpi.id && "bg-sky-50"
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500/25 bg-sky-500/15 text-[11px] font-bold text-sky-600">
                        {kpi.nombre.charAt(0)}
                        {kpi.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {kpi.nombre} {kpi.apellido}
                        </p>
                        <p className="text-xs text-slate-400">{totalRate}% tasa de cierre</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-semibold text-green-600">
                        {kpi.ticketsCompletados}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="border-sky-500/25 bg-sky-500/15 text-xs text-sky-600">
                      {kpi.ticketsActivos}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <div className="flex items-center justify-center gap-1 text-slate-600">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {kpi.tiempoPromedioMinutos > 0
                          ? formatMinutesToDuration(kpi.tiempoPromedioMinutos)
                          : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-right lg:table-cell">
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(kpi.montoTotal)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-right lg:table-cell">
                    {kpi.montoPendiente > 0 ? (
                      <span className="text-sm font-medium text-amber-500">
                        {formatCurrency(kpi.montoPendiente)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(selected?.id === kpi.id ? null : kpi)}
                      className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900"
                    >
                      {selected?.id === kpi.id ? "Cerrar" : "Detalle"}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-5 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-sky-500/30 bg-sky-500/20 text-sm font-bold text-sky-700">
                {selected.nombre.charAt(0)}
                {selected.apellido.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">
                  {selected.nombre} {selected.apellido}
                </h4>
                <p className="text-xs text-slate-500">Desglose de rendimiento</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSelected(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="mb-1 text-xs text-slate-500">Completados</p>
              <p className="text-xl font-bold text-green-600">
                {selected.ticketsCompletados}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="mb-1 text-xs text-slate-500">En progreso</p>
              <p className="text-xl font-bold text-sky-600">{selected.ticketsActivos}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="mb-1 text-xs text-slate-500">Tiempo prom.</p>
              <p className="text-base font-bold text-slate-800">
                {selected.tiempoPromedioMinutos > 0
                  ? formatMinutesToDuration(selected.tiempoPromedioMinutos)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <p className="mb-1 text-xs text-slate-500">Pend. de pago</p>
              <p className="text-base font-bold text-amber-500">
                {selected.montoPendiente > 0
                  ? formatCurrency(selected.montoPendiente)
                  : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">
              Monto total generado:{" "}
              <span className="font-medium text-slate-800">
                {formatCurrency(selected.montoTotal)}
              </span>
            </span>
            <DollarSign className="ml-2 h-3.5 w-3.5 text-slate-400" />
            <span className="text-xs text-slate-500">
              Pendiente de cobro:{" "}
              <span className="font-medium text-amber-500">
                {formatCurrency(selected.montoPendiente)}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
