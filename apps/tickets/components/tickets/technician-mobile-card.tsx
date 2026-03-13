import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { Ticket } from "@/types"
import { PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/types"

interface TechnicianMobileCardProps {
  ticket: Ticket
}

export function TechnicianMobileCard({ ticket }: TechnicianMobileCardProps) {
  return (
    <Link href={`/dashboard/tickets/${ticket.id}`}>
      <div className={cn("mobile-ticket-card", `mobile-ticket-card-${ticket.estado}`)}>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-semibold text-blue-500/80">{ticket.numero_ticket}</span>
          <Badge className={`px-2 py-0.5 text-[10px] ${STATUS_COLORS[ticket.estado]}`}>
            {STATUS_LABELS[ticket.estado]}
          </Badge>
          <Badge className={`ml-auto px-2 py-0.5 text-[10px] ${PRIORITY_COLORS[ticket.prioridad]}`}>
            {ticket.prioridad}
          </Badge>
        </div>

        <p className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-slate-900">
          {ticket.asunto}
        </p>

        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          <span className="truncate">{ticket.cliente_nombre}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(ticket.created_at)}
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-end text-xs font-medium text-blue-500/70">
          Ver detalles
          <ChevronRight className="ml-0.5 h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  )
}
