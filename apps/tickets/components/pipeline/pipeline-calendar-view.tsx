import Link from "next/link"
import { CalendarDays, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, formatDateTime, getElapsedMinutes, formatMinutesToDuration } from "@/lib/utils"
import type { Ticket } from "@/types"
import { PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from "@/types"

interface PipelineCalendarViewProps {
  tickets: Ticket[]
}

function getDateKey(date: string | null) {
  if (!date) return "Sin fecha programada"
  return new Date(date).toISOString().slice(0, 10)
}

export function PipelineCalendarView({ tickets }: PipelineCalendarViewProps) {
  const groups = Object.entries(
    tickets.reduce<Record<string, Ticket[]>>((acc, ticket) => {
      const key = getDateKey(ticket.fecha_servicio)
      acc[key] = [...(acc[key] || []), ticket]
      return acc
    }, {})
  ).sort(([left], [right]) => {
    if (left === "Sin fecha programada") return 1
    if (right === "Sin fecha programada") return -1
    return left.localeCompare(right)
  })

  if (groups.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="py-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-700">Sin tickets disponibles</p>
          <p className="mt-1 text-xs text-slate-500">Asigna una fecha de servicio al crear o editar el ticket para verlo aquí.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map(([dateKey, dayTickets]) => (
        <Card key={dateKey} variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-sky-500" />
              {dateKey === "Sin fecha programada" ? dateKey : formatDate(dateKey)}
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-700">
                {dayTickets.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dayTickets
              .sort((a, b) => new Date(a.fecha_servicio || 0).getTime() - new Date(b.fecha_servicio || 0).getTime())
              .map((ticket) => {
                const elapsed = getElapsedMinutes(ticket.fecha_inicio, ticket.fecha_finalizacion)

                return (
                  <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-sky-600">{ticket.numero_ticket}</span>
                      <Badge className={STATUS_COLORS[ticket.estado]}>{STATUS_LABELS[ticket.estado]}</Badge>
                      <Badge className={PRIORITY_COLORS[ticket.prioridad]}>{ticket.prioridad}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{ticket.asunto}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.cliente_nombre}</p>

                    <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ticket.fecha_servicio ? formatDateTime(ticket.fecha_servicio) : "Sin fecha"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{ticket.fecha_llegada ? `Llegada: ${formatDateTime(ticket.fecha_llegada)}` : "Sin llegada registrada"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">Duración:</span>{" "}
                        {ticket.tiempo_trabajado ? formatMinutesToDuration(ticket.tiempo_trabajado) : elapsed ? formatMinutesToDuration(elapsed) : "—"}
                      </div>
                    </div>
                  </Link>
                )
              })}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
