"use client"

import { useMemo, useState } from "react"
import { Building2, MapPin, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Agencia } from "@/types"

const STATUS_COPY: Record<Agencia["estado_operativo"], { label: string; variant: "success" | "warning" | "secondary" }> = {
  activa: { label: "Activa", variant: "success" },
  mantenimiento: { label: "Mantenimiento", variant: "warning" },
  inactiva: { label: "Inactiva", variant: "secondary" },
}

export function DirectorioAgencias({ initialAgencias }: { initialAgencias: Agencia[] }) {
  const [query, setQuery] = useState("")

  const filteredAgencias = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return initialAgencias
    }

    return initialAgencias.filter((agencia) =>
      `${agencia.nombre} ${agencia.region} ${agencia.ciudad} ${agencia.contacto ?? ""} ${agencia.direccion ?? ""}`
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [initialAgencias, query])

  const agenciasActivas = useMemo(
    () => initialAgencias.filter((agencia) => agencia.estado_operativo === "activa").length,
    [initialAgencias],
  )

  return (
    <div className="space-y-4">
      <Card variant="default">
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Directorio de agencias</CardTitle>
            <CardDescription>
              Consulta las sedes registradas para la planificacion de mantenimiento preventivo.
            </CardDescription>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por agencia, ciudad o region"
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{initialAgencias.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Activas</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{agenciasActivas}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Resultados</p>
            <p className="mt-2 text-2xl font-semibold text-slate-800">{filteredAgencias.length}</p>
          </div>
        </CardContent>
      </Card>

      {filteredAgencias.length === 0 ? (
        <Card variant="default">
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No hay agencias que coincidan con la busqueda actual.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredAgencias.map((agencia) => {
            const status = STATUS_COPY[agencia.estado_operativo]

            return (
              <Card key={agencia.id} variant="default" className="border-slate-200">
                <CardHeader className="gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-slate-500" />
                        <CardTitle className="truncate text-lg">{agencia.nombre}</CardTitle>
                      </div>
                      <CardDescription className="mt-1">
                        {agencia.region} · {agencia.ciudad}
                      </CardDescription>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <span>{agencia.direccion || "Direccion no registrada"}</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Contacto</p>
                      <p className="mt-1 text-sm text-slate-700">{agencia.contacto || "Sin contacto"}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">ID</p>
                      <p className="mt-1 text-sm text-slate-700">#{agencia.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
