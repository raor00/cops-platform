"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, formatMinutesToDuration, getElapsedMinutes, VENEZUELA_TIMEZONE } from "@/lib/utils"
import type { Ticket } from "@/types"
import { PRIORITY_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/types"

interface PipelineCalendarViewProps {
  tickets: Ticket[]
}

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: VENEZUELA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function getTicketDateKey(value: string | null) {
  return value ? dateKey(new Date(value)) : null
}

export function PipelineCalendarView({ tickets }: PipelineCalendarViewProps) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const calendarData = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstWeekDay = (firstDay.getDay() + 6) % 7
    const totalCells = Math.ceil((firstWeekDay + lastDay.getDate()) / 7) * 7

    const ticketsByDay = new Map<string, Ticket[]>()
    for (const ticket of tickets) {
      const key = getTicketDateKey(ticket.fecha_servicio)
      if (!key) continue
      ticketsByDay.set(key, [...(ticketsByDay.get(key) || []), ticket])
    }

    const days = Array.from({ length: totalCells }, (_, index) => {
      const date = new Date(year, month, index - firstWeekDay + 1)
      const key = dateKey(date)
      return {
        date,
        key,
        isCurrentMonth: date.getMonth() === month,
        tickets: (ticketsByDay.get(key) || []).sort((a, b) => new Date(a.fecha_servicio || 0).getTime() - new Date(b.fecha_servicio || 0).getTime()),
      }
    })

    return { days, monthLabel: new Intl.DateTimeFormat("es-VE", { month: "long", year: "numeric", timeZone: VENEZUELA_TIMEZONE }).format(firstDay) }
  }, [cursor, tickets])

  const unscheduledTickets = tickets.filter((ticket) => !ticket.fecha_servicio)

  return (
    <div className="space-y-4">
      <Card variant="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 sm:pb-6">
          <CardTitle className="text-base capitalize sm:text-lg">{calendarData.monthLabel}</CardTitle>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 pb-2 pt-0 sm:px-6 sm:pb-6">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:gap-2 sm:text-xs">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="py-1 sm:py-2">{day}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1 sm:mt-2 sm:gap-2">
            {calendarData.days.map((day) => (
              <div
                key={day.key}
                className={[
                  "min-h-[76px] rounded-lg border p-1 align-top sm:min-h-[140px] sm:rounded-xl sm:p-2",
                  day.isCurrentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50/60 text-slate-400",
                ].join(" ")}
              >
                <div className="mb-1 text-right text-[10px] font-semibold sm:mb-2 sm:text-xs">{day.date.getDate()}</div>
                <div className="space-y-1 sm:space-y-2">
                  {day.tickets.slice(0, 1).map((ticket) => (
                    <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`} className="block rounded-md border border-slate-200 bg-slate-50 px-1 py-1 text-left text-[9px] transition-colors hover:bg-slate-100 sm:rounded-lg sm:px-2 sm:py-1.5 sm:text-[11px]">
                      <p className="truncate font-semibold text-slate-800">{ticket.numero_ticket}</p>
                      <p className="hidden truncate text-slate-600 sm:block">{ticket.asunto}</p>
                      <div className="mt-0.5 flex items-center gap-1 sm:mt-1">
                        <Badge className={STATUS_COLORS[ticket.estado]}>{STATUS_LABELS[ticket.estado]}</Badge>
                      </div>
                    </Link>
                  ))}
                  {day.tickets.length > 1 && (
                    <p className="text-[9px] font-medium text-sky-600 sm:text-[11px]">+{day.tickets.length - 1} más</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {unscheduledTickets.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">Tickets sin fecha programada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unscheduledTickets.map((ticket) => {
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
                      <span>Sin fecha programada</span>
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
      )}
    </div>
  )
}
