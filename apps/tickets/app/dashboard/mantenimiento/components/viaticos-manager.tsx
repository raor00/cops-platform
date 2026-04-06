"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Car } from "lucide-react"
import type { Viatico, VisitaMantenimiento } from "@/types"

const ESTADO_LABELS: Record<string, string> = {
    planeado: "Planeado",
    enviado: "Pendiente Aprobación",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
}

function getEstadoBadgeClass(estado: string) {
    if (estado === "aprobado") return "bg-blue-50 text-blue-700"
    if (estado === "rechazado") return "bg-red-50 text-red-700"
    return "bg-yellow-50 text-yellow-700"
}

export function ViaticosManager({
    isCoordinator,
    initialViaticos,
}: {
    userId: string
    isCoordinator: boolean
    initialViaticos: Viatico[]
    initialVisitas: VisitaMantenimiento[]
}) {
    const totalAprobado = initialViaticos
        .filter((v) => v.estado === "aprobado")
        .reduce((acc, v) => acc + v.monto, 0)

    const totalPendiente = initialViaticos
        .filter((v) => v.estado === "enviado")
        .reduce((acc, v) => acc + v.monto, 0)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">Administración de Viáticos</h2>
                <p className="text-sm text-slate-500">Gestión de presupuestos de viaje y ruta para mantenimientos.</p>
            </div>

            {initialViaticos.length === 0 ? (
                <Card className="border-slate-200 bg-white p-12 text-center">
                    <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Sin viáticos registrados</p>
                    <p className="text-slate-400 text-sm mt-1">Aún no hay solicitudes de viático para este periodo.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-3">Técnico</th>
                                        <th className="px-5 py-3">Concepto</th>
                                        <th className="px-5 py-3">Monto</th>
                                        <th className="px-5 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {initialViaticos.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/50">
                                            <td className="px-5 py-4 font-medium text-slate-800">
                                                {item.tecnico
                                                    ? `${item.tecnico.nombre} ${item.tecnico.apellido}`
                                                    : item.tecnico_id}
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Car className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.ruta ?? item.detalle ?? "—"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-mono text-slate-700">
                                                ${item.monto.toFixed(2)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <Badge variant="outline" className={getEstadoBadgeClass(item.estado)}>
                                                    {ESTADO_LABELS[item.estado] ?? item.estado}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>

                    {isCoordinator && (
                        <div className="space-y-4">
                            <Card className="p-5 border-slate-200 bg-white shadow-sm">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-blue-600" />
                                    Resumen Financiero
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                                        <span className="text-blue-800 text-sm font-medium">Ejecutado (Aprobado)</span>
                                        <span className="font-bold text-blue-700">${totalAprobado.toFixed(2)}</span>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-lg flex justify-between items-center border border-amber-100">
                                        <span className="text-amber-800 text-sm font-medium">Por Aprobar</span>
                                        <span className="font-bold text-amber-700">${totalPendiente.toFixed(2)}</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
