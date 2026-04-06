"use client"

import { Card } from "@/components/ui/card"
import { FileBarChart2, TrendingUp, Calendar as CalIcon, MapPin } from "lucide-react"
import type { MantenimientoReportes } from "@/types"

function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-VE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })
}

export function ReportesMantenimiento({ initialReportes }: { initialReportes?: MantenimientoReportes }) {
    if (!initialReportes) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Informes y Reportes</h2>
                    <p className="text-sm text-slate-500">Genera y exporta el estatus general y bitácoras de los equipos usados.</p>
                </div>
                <Card className="border-slate-200 bg-white p-12 text-center">
                    <FileBarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Sin reportes disponibles</p>
                    <p className="text-slate-400 text-sm mt-1">Los reportes se generarán a medida que se completen visitas.</p>
                </Card>
            </div>
        )
    }

    const { resumen, ultimas_bitacoras } = initialReportes

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-800">Informes y Reportes</h2>
                <p className="text-sm text-slate-500">Genera y exporta el estatus general y bitácoras de los equipos usados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Agencias Atendidas</p>
                            <h3 className="text-2xl font-bold text-slate-800">{resumen.agencias_atendidas}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <FileBarChart2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Visitas Completadas</p>
                            <h3 className="text-2xl font-bold text-slate-800">
                                {resumen.visitas_completadas}
                                <span className="text-sm font-normal text-slate-400"> / {resumen.total_visitas}</span>
                            </h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CalIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Visitas Pendientes</p>
                            <h3 className="text-2xl font-bold text-slate-800">{resumen.visitas_pendientes}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {ultimas_bitacoras.length === 0 ? (
                <Card className="border-slate-200 bg-white p-10 text-center">
                    <p className="text-slate-400 text-sm">No hay bitácoras registradas aún.</p>
                </Card>
            ) : (
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                        <h3 className="font-semibold text-slate-800">Últimas Bitácoras de Técnicos</h3>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-5 py-3">Agencia</th>
                                <th className="px-5 py-3">Técnico</th>
                                <th className="px-5 py-3">Fecha</th>
                                <th className="px-5 py-3">Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {ultimas_bitacoras.map((bitacora) => (
                                <tr key={bitacora.bitacora_id} className="hover:bg-slate-50/50">
                                    <td className="px-5 py-4 font-medium text-slate-800">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {bitacora.agencia_nombre}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{bitacora.tecnico_nombre}</td>
                                    <td className="px-5 py-4 text-slate-600">{formatFecha(bitacora.created_at)}</td>
                                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{bitacora.log}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}
        </div>
    )
}
