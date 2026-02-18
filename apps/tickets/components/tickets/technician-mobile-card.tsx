import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatRelativeTime } from "@/lib/utils"
import type { Ticket } from "@/types"
import { STATUS_LABELS, PRIORITY_COLORS, STATUS_COLORS } from "@/types"
import { cn } from "@/lib/utils"

interface TechnicianMobileCardProps {
  ticket: Ticket
}

export function TechnicianMobileCard({ ticket }: TechnicianMobileCardProps) {
  return (
    <Link href={`/dashboard/tickets/${ticket.id}`}>
      <div
        className={cn(
          "mobile-ticket-card",
          `mobile-ticket-card-${ticket.estado}`
        )}
      >
        {/* Top row: ticket number + status + priority */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-mono text-blue-300/80 font-semibold">
            {ticket.numero_ticket}
          </span>
          <Badge className={`text-[10px] px-2 py-0.5 ${STATUS_COLORS[ticket.estado]}`}>
            {STATUS_LABELS[ticket.estado]}
          </Badge>
          <Badge className={`text-[10px] px-2 py-0.5 ml-auto ${PRIORITY_COLORS[ticket.prioridad]}`}>
            {ticket.prioridad}
          </Badge>
        </div>

        {/* Subject */}
        <p className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">
          {ticket.asunto}
        </p>

        {/* Client + time row */}
        <div className="flex items-center justify-between gap-2 text-xs text-white/50">
          <span className="truncate">{ticket.cliente_nombre}</span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(ticket.created_at)}
          </span>
        </div>

        {/* Ver detalles indicator */}
        <div className="flex items-center justify-end mt-2.5 text-xs text-blue-400/70 font-medium">
          Ver detalles
          <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
        </div>
      </div>
    </Link>
  )
}
