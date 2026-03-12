"use client"

import { useMemo } from "react"
import { CalendarDays, Route, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export function CalendarioMantenimiento({
  initialVisitas,
  rutinas,
  technicians,
}: CalendarioMantenimientoProps) {
  const visitasProgramadas = useMemo(
    () => initialVisitas.filter((visita) => visita.estado !== "cancelada").length,
    [initialVisitas],
  )

  return (
    <div className="space-y-4">
      <Card variant="default">
        <CardHeader>
          <CardTitle>Calendario regional</CardTitle>
          <CardDescription>
            Vista resumida de la programacion de mantenimiento preventivo por rutina y visitas asignadas.
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
              <span className="text-xs font-medium uppercase tracking-wide">Tecnicos</span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{technicians.length}</p>
          </div>
        </CardContent>
      </Card>

      <Card variant="default">
        <CardContent className="py-10 text-sm text-slate-500">
          El calendario visual detallado todavia no esta implementado en este modulo, pero la estructura ya recibe las visitas,
          rutinas y tecnicos necesarios para completarlo sin volver a tocar la pagina padre.
        </CardContent>
      </Card>
    </div>
  )
}
