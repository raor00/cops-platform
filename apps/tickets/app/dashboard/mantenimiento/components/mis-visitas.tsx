"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Wrench, AlertTriangle } from "lucide-react"
import type { VisitaMantenimiento } from "@/types"

const ESTADO_LABELS: Record<string, string> = {
    pendiente: "Pendiente",
    en_camino: "En Camino",
    en_proceso: "En Proceso",
    completada: "Completada",
    cancelada: "Cancelada",
}

function getBorderClass(estado: string) {
    if (estado === "completada") return "border-l-green-500"
    if (estado === "en_proceso" || estado === "en_camino") return "border-l-blue-500"
    return "border-l-orange-500"
}

function getBadgeClass(estado: string) {
    if (estado === "completada") return "bg-green-50 text-green-700"
    if (estado === "en_proceso" || estado === "en_camino") return "bg-blue-50 text-blue-700"
    return "bg-orange-50 text-orange-700"
}

function formatFecha(fecha: string | null) {
    if (!fecha) return "Sin fecha"
    return new Date(fecha).toLocaleDateString("es-VE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function MisVisitas({ initialVisitas }: { userId: string; initialVisitas: VisitaMantenimiento[] }) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">Mis Visitas Asignadas</h2>
                <p className="text-sm text-slate-500">Visitas de mantenimiento programadas para ti.</p>
            </div>

            {initialVisitas.length === 0 ? (
                <Card className="border-slate-200 bg-white p-12 text-center">
                    <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Sin visitas asignadas</p>
                    <p className="text-slate-400 text-sm mt-1">No tienes visitas de mantenimiento pendientes por el momento.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {initialVisitas.map((visita) => (
                        <Card
                            key={visita.id}
                            className={`p-5 border-l-4 transition-all hover:shadow-md ${getBorderClass(visita.estado)}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <Badge variant="outline" className={getBadgeClass(visita.estado)}>
                                    {ESTADO_LABELS[visita.estado] ?? visita.estado}
                                </Badge>
                                {visita.agencia?.estado_operativo === "mantenimiento" && (
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                )}
                            </div>

                            <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-2">
                                {visita.agencia?.nombre ?? `Agencia #${visita.agencia_id}`}
                            </h3>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    {formatFecha(visita.fecha_programada)}
                                </div>
                                {visita.agencia?.ciudad && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {visita.agencia.ciudad}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
