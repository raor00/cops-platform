import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDateTime, formatRelativeTime, getFullName, getInitials } from "@/lib/utils"
import type { Ticket, TicketStatus } from "@/types"
import { PRIORITY_COLORS, STATUS_LABELS } from "@/types"

interface PipelinePageBoardProps {
  tickets: Ticket[]
}

const PIPELINE_COLUMNS: TicketStatus[] = ["asignado", "iniciado", "en_progreso", "finalizado"]

const COLUMN_HEADER_COLORS: Record<TicketStatus, string> = {
  borrador: "border-slate-300 bg-slate-50",
  asignado: "border-blue-200 bg-blue-50",
  iniciado: "border-amber-200 bg-amber-50",
  en_progreso: "border-violet-200 bg-violet-50",
  finalizado: "border-green-200 bg-green-50",
  cancelado: "border-red-200 bg-red-50",
}

const COLUMN_DOT_COLORS: Record<TicketStatus, string> = {
  borrador: "bg-slate-400",
  asignado: "bg-blue-500",
  iniciado: "bg-amber-500",
  en_progreso: "bg-violet-500",
  finalizado: "bg-green-500",
  cancelado: "bg-red-500",
}

const SLA_MS = 72 * 60 * 60 * 1000

function isSlaBreached(ticket: Ticket) {
  if (ticket.estado === "finalizado" || ticket.estado === "cancelado") return false
  return Date.now() - new Date(ticket.created_at).getTime() > SLA_MS
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const slaBreached = isSlaBreached(ticket)

  return (
    <Link href={`/dashboard/tickets/${ticket.id}`}>
      <div className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 hover:border-sky-200 hover:bg-slate-50">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-xs font-mono text-blue-500/80">{ticket.numero_ticket}</span>
            {slaBreached && (
              <span title="SLA vencido">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
              </span>
            )}
          </div>
          <Badge className={`shrink-0 px-1.5 py-0.5 text-[10px] ${PRIORITY_COLORS[ticket.prioridad]}`}>
            {ticket.prioridad}
          </Badge>
        </div>

        <p className="mb-2 line-clamp-2 text-sm font-medium leading-snug text-slate-900 transition-colors group-hover:text-sky-700">
          {ticket.asunto}
        </p>

        <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
          <span className="max-w-[120px] truncate">{ticket.cliente_nombre}</span>
          <span>{formatRelativeTime(ticket.created_at)}</span>
        </div>

        {ticket.fecha_servicio && (
          <div className="mb-1.5 text-[11px] text-slate-500">
            Servicio: <span className="font-medium text-slate-700">{formatDateTime(ticket.fecha_servicio)}</span>
          </div>
        )}

        {ticket.tecnico && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-700">
              {getInitials(ticket.tecnico.nombre, ticket.tecnico.apellido)}
            </div>
            <span className="truncate">
              {getFullName(ticket.tecnico.nombre, ticket.tecnico.apellido)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function PipelinePageBoard({ tickets }: PipelinePageBoardProps) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4">
      {PIPELINE_COLUMNS.map((status) => {
        const columnTickets = tickets.filter((ticket) => ticket.estado === status)

        return (
          <div key={status} className="flex w-[300px] shrink-0 flex-col sm:w-[320px]">
            <div className={`mb-3 flex items-center gap-2 rounded-xl border px-3 py-2 ${COLUMN_HEADER_COLORS[status]}`}>
              <span className={`h-2 w-2 shrink-0 rounded-full ${COLUMN_DOT_COLORS[status]}`} />
              <span className="text-sm font-semibold text-slate-800">{STATUS_LABELS[status]}</span>
              <span className="ml-auto rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-slate-500">
                {columnTickets.length}
              </span>
            </div>

            <div className="max-h-[calc(100vh-320px)] space-y-2 overflow-y-auto pr-1">
              {columnTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                  Sin tickets en este estado
                </div>
              ) : (
                columnTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
