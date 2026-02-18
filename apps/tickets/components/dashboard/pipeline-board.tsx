import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import type { Ticket, TicketStatus } from "@/types"
import { STATUS_LABELS, STATUS_COLORS, PRIORITY_COLORS } from "@/types"

interface PipelineBoardProps {
  tickets: Ticket[]
}

const PIPELINE_COLUMNS: TicketStatus[] = ["asignado", "iniciado", "en_progreso", "finalizado"]

const COLUMN_HEADER_COLORS: Record<TicketStatus, string> = {
  asignado: "border-blue-500/40 bg-blue-500/10",
  iniciado: "border-yellow-500/40 bg-yellow-500/10",
  en_progreso: "border-purple-500/40 bg-purple-500/10",
  finalizado: "border-green-500/40 bg-green-500/10",
  cancelado: "border-red-500/40 bg-red-500/10",
}

const COLUMN_DOT_COLORS: Record<TicketStatus, string> = {
  asignado: "bg-blue-400",
  iniciado: "bg-yellow-400",
  en_progreso: "bg-purple-400",
  finalizado: "bg-green-400",
  cancelado: "bg-red-400",
}

interface TicketCardProps {
  ticket: Ticket
}

function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link href={`/dashboard/tickets/${ticket.id}`}>
      <div className="rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 p-3 group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs font-mono text-blue-400/80 shrink-0">{ticket.numero_ticket}</span>
          <Badge className={`text-[10px] px-1.5 py-0.5 ${PRIORITY_COLORS[ticket.prioridad]}`}>
            {ticket.prioridad}
          </Badge>
        </div>
        <p className="text-sm font-medium text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors">
          {ticket.asunto}
        </p>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span className="truncate max-w-[100px]">{ticket.cliente_nombre}</span>
          <span>{formatRelativeTime(ticket.created_at)}</span>
        </div>
        {ticket.tecnico && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-white/40">
            <div className="h-4 w-4 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold text-white/60">
              {ticket.tecnico.nombre.charAt(0)}
            </div>
            <span className="truncate">{ticket.tecnico.nombre} {ticket.tecnico.apellido}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export function PipelineBoard({ tickets }: PipelineBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
      {PIPELINE_COLUMNS.map((status) => {
        const columnTickets = tickets.filter((t) => t.estado === status)
        return (
          <div key={status} className="shrink-0 w-[240px] sm:w-[260px]">
            {/* Column header */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 mb-3 ${COLUMN_HEADER_COLORS[status]}`}
            >
              <span className={`h-2 w-2 rounded-full ${COLUMN_DOT_COLORS[status]}`} />
              <span className="text-sm font-semibold text-white/80">
                {STATUS_LABELS[status]}
              </span>
              <span className="ml-auto text-xs text-white/40 font-medium">
                {columnTickets.length}
              </span>
            </div>

            {/* Column tickets */}
            <div className="space-y-2">
              {columnTickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-white/30">
                  Sin tickets
                </div>
              ) : (
                columnTickets.slice(0, 5).map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))
              )}
              {columnTickets.length > 5 && (
                <Link
                  href={`/dashboard/tickets?status=${status}`}
                  className="block text-center text-xs text-blue-400/70 hover:text-blue-400 py-2 transition-colors"
                >
                  +{columnTickets.length - 5} más
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
