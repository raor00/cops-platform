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
      <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
        <Users className="h-8 w-8 text-white/20 mx-auto mb-3" />
        <p className="text-white/40 text-sm">No hay datos de técnicos disponibles</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs font-semibold text-white/50 uppercase tracking-wider">
                Técnico
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider">
                Completados
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider">
                Activos
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-white/50 uppercase tracking-wider hidden md:table-cell">
                Tiempo Prom.
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider hidden lg:table-cell">
                Monto Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-white/50 uppercase tracking-wider hidden lg:table-cell">
                Pendiente
              </th>
              <th className="px-4 py-3 text-right" />
            </tr>
          </thead>
          <tbody>
            {kpis.map((kpi, i) => {
              const totalRate =
                kpi.ticketsCompletados + kpi.ticketsActivos > 0
                  ? Math.round((kpi.ticketsCompletados / (kpi.ticketsCompletados + kpi.ticketsActivos)) * 100)
                  : 0

              return (
                <tr
                  key={kpi.id}
                  className={cn(
                    "border-b border-white/5 transition-colors hover:bg-white/[0.04]",
                    selected?.id === kpi.id && "bg-sky-500/5"
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-[11px] font-bold text-sky-300 shrink-0">
                        {kpi.nombre.charAt(0)}{kpi.apellido.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">
                          {kpi.nombre} {kpi.apellido}
                        </p>
                        <p className="text-xs text-white/40">{totalRate}% tasa de cierre</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      <span className="font-semibold text-green-400">{kpi.ticketsCompletados}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/25 text-xs">
                      {kpi.ticketsActivos}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">
                    <div className="flex items-center justify-center gap-1 text-white/60">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-xs">
                        {kpi.tiempoPromedioMinutos > 0
                          ? formatMinutesToDuration(kpi.tiempoPromedioMinutos)
                          : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <span className="text-white/70 text-sm font-medium">
                      {formatCurrency(kpi.montoTotal)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    {kpi.montoPendiente > 0 ? (
                      <span className="text-amber-400 text-sm font-medium">
                        {formatCurrency(kpi.montoPendiente)}
                      </span>
                    ) : (
                      <span className="text-white/30 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(selected?.id === kpi.id ? null : kpi)}
                      className="text-xs text-white/50 hover:text-white h-7 px-2"
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

      {/* Panel de detalle expandido */}
      {selected && (
        <div className="mt-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sm font-bold text-sky-300">
                {selected.nombre.charAt(0)}{selected.apellido.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-white">
                  {selected.nombre} {selected.apellido}
                </h4>
                <p className="text-xs text-white/50">Desglose de rendimiento</p>
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

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xs text-white/50 mb-1">Completados</p>
              <p className="text-xl font-bold text-green-400">{selected.ticketsCompletados}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xs text-white/50 mb-1">En progreso</p>
              <p className="text-xl font-bold text-sky-400">{selected.ticketsActivos}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xs text-white/50 mb-1">Tiempo prom.</p>
              <p className="text-base font-bold text-white/80">
                {selected.tiempoPromedioMinutos > 0
                  ? formatMinutesToDuration(selected.tiempoPromedioMinutos)
                  : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
              <p className="text-xs text-white/50 mb-1">Pend. de pago</p>
              <p className="text-base font-bold text-amber-400">
                {selected.montoPendiente > 0 ? formatCurrency(selected.montoPendiente) : "—"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-white/40" />
            <span className="text-xs text-white/50">
              Monto total generado: <span className="text-white/80 font-medium">{formatCurrency(selected.montoTotal)}</span>
            </span>
            <DollarSign className="h-3.5 w-3.5 text-white/40 ml-2" />
            <span className="text-xs text-white/50">
              Pendiente de cobro: <span className="text-amber-400 font-medium">{formatCurrency(selected.montoPendiente)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
