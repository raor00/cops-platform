"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { Ticket, TicketStatus } from "@/types"
import { STATUS_LABELS } from "@/types"
import { TechnicianMobileCard } from "./technician-mobile-card"

interface TechnicianMobileListProps {
  tickets: Ticket[]
  currentStatus?: string
}

const STATUS_PILLS: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "asignado", label: STATUS_LABELS.asignado },
  { value: "iniciado", label: STATUS_LABELS.iniciado },
  { value: "en_progreso", label: STATUS_LABELS.en_progreso },
  { value: "finalizado", label: STATUS_LABELS.finalizado },
]

const PILL_ACTIVE_COLORS: Record<string, string> = {
  all: "border-slate-200 bg-slate-100 text-slate-900",
  asignado: "border-blue-200 bg-blue-50 text-blue-700",
  iniciado: "border-amber-200 bg-amber-50 text-amber-700",
  en_progreso: "border-violet-200 bg-violet-50 text-violet-700",
  finalizado: "border-green-200 bg-green-50 text-green-700",
}

export function TechnicianMobileList({ tickets, currentStatus }: TechnicianMobileListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setStatus = useCallback(
    (status: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (!status || status === "all") {
        params.delete("status")
      } else {
        params.set("status", status)
      }
      params.delete("page")
      router.push(pathname + (params.toString() ? `?${params.toString()}` : ""))
    },
    [pathname, router, searchParams]
  )

  const activeFilter = currentStatus ?? "all"

  return (
    <div>
      <div className="status-pills-bar mb-4">
        {STATUS_PILLS.map((pill) => {
          const isActive = pill.value === activeFilter
          return (
            <button
              key={pill.value}
              onClick={() => setStatus(pill.value === "all" ? null : pill.value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150",
                isActive
                  ? PILL_ACTIVE_COLORS[pill.value] ?? "border-slate-200 bg-slate-100 text-slate-900"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
          <p className="text-sm text-slate-500">Sin tickets en esta categoria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, index) => (
            <div key={ticket.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}>
              <TechnicianMobileCard ticket={ticket} />
            </div>
          ))}
        </div>
      )}

      {tickets.length > 0 && (
        <p className="mt-4 text-center text-xs text-slate-400">
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
