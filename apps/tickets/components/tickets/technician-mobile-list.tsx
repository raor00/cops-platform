"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { TechnicianMobileCard } from "./technician-mobile-card"
import type { Ticket, TicketStatus } from "@/types"
import { STATUS_LABELS } from "@/types"
import { cn } from "@/lib/utils"

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
  all: "bg-white/20 text-white border-white/30",
  asignado: "bg-blue-500/30 text-blue-300 border-blue-400/40",
  iniciado: "bg-yellow-500/30 text-yellow-300 border-yellow-400/40",
  en_progreso: "bg-purple-500/30 text-purple-300 border-purple-400/40",
  finalizado: "bg-green-500/30 text-green-300 border-green-400/40",
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
      // Reset to page 1
      params.delete("page")
      router.push(pathname + (params.toString() ? "?" + params.toString() : ""))
    },
    [router, pathname, searchParams]
  )

  const activeFilter = currentStatus ?? "all"

  return (
    <div>
      {/* Status filter pills */}
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
                  ? PILL_ACTIVE_COLORS[pill.value] ?? "bg-white/20 text-white border-white/30"
                  : "border-white/15 text-white/50 hover:border-white/25 hover:text-white/70"
              )}
            >
              {pill.label}
            </button>
          )
        })}
      </div>

      {/* Ticket list */}
      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="text-white/40 text-sm">Sin tickets en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket, i) => (
            <div
              key={ticket.id}
              className={`animate-slide-up stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`}
            >
              <TechnicianMobileCard ticket={ticket} />
            </div>
          ))}
        </div>
      )}

      {/* Ticket count */}
      {tickets.length > 0 && (
        <p className="text-center text-xs text-white/30 mt-4">
          {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
