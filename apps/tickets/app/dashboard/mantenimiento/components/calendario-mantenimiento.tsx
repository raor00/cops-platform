"use client"

import { useMemo } from "react"
import { CalendarDays, Route, Users, MapPin, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RutinaMantenimiento, VisitaMantenimiento } from "@/types"

type MaintenanceTechnician = {
  id: string
  nombre: string
  apellido: string
}

interface CalendarioMantenimientoProps {
  initialVisitas: VisitaMantenimiento[]
  rutinas: RutinaMantenimiento[]
  technicians: MaintenanceTechnician[]
}

const ESTADO_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_camino: "En Camino",
  en_proceso: "En Proceso",
  completada: "Completada",
  cancelada: "Cancelada",
}

function getBadgeClass(estado: string) {
  if (estado === "completada") return "bg-green-50 text-green-700 border-green-200"
  if (estado === "en_proceso" || estado === "en_camino") return "bg-blue-50 text-blue-700 border-blue-200"
  if (estado === "cancelada") return "bg-red-50 text-red-700 border-red-200"
  return "bg-orange-50 text-orange-700 border-orange-200"
}

function formatFecha(fecha: string | null) {
  if (!fecha) return "Sin fecha"
  return new Date(fecha).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function CalendarioMantenimiento({
  initialVisitas,
  rutinas,
  technicians,
}: CalendarioMantenimientoProps) {
  const visitasProgramadas = useMemo(
    () => initialVisitas.filter((visita) => visita.estado !== "cancelada").length,
    [initialVisitas],
  )

  const visitasProximas = useMemo(
    () =>
      initialVisitas
        .filter((v) => v.estado !== "cancelada" && v.estado !== "completada")
        .sort((a, b) => {
          if (!a.fecha_programada) return 1
          if (!b.fecha_programada) return -1
          return new Date(a.fecha_programada).getTime() - new Date(b.fecha_programada).getTime()
        }),
    [initialVisitas],
  )

  return (
    <div className="space-y-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Calendario regional</CardTitle>
          <CardDescription>
            Vista resumida de la programación de mantenimiento preventivo por rutina y visitas asignadas.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Rutinas</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{rutinas.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Visitas</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{visitasProgramadas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Técnicos</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{technicians.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base">Próximas Visitas</CardTitle>
          <CardDescription>Visitas pendientes ordenadas por fecha programada.</CardDescription>
        </CardHeader>
        <CardContent>
          {visitasProximas.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Sin visitas próximas</p>
              <p className="text-slate-400 text-xs mt-1">No hay visitas pendientes o en proceso registradas.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visitasProximas.map((visita) => (
                <div key={visita.id} className="flex items-center justify-between py-3 gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {visita.agencia?.nombre ?? `Agencia #${visita.agencia_id}`}
                      </p>
                      {visita.tecnico && (
                        <p className="text-xs text-slate-500">
                          {visita.tecnico.nombre} {visita.tecnico.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-slate-500">{formatFecha(visita.fecha_programada)}</span>
                    <Badge variant="outline" className={getBadgeClass(visita.estado)}>
                      {ESTADO_LABELS[visita.estado] ?? visita.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
