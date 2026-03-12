"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Car, FileText, CheckCircle2 } from "lucide-react"
import type { Viatico, VisitaMantenimiento } from "@/types"

const MOCK_VIATICOS = [
    { id: 1, tecnico: "Omar Lopez", ruta: "Caracas - Valencia", monto: "$120.00", estado: "Pendiente Aprobación", fecha: "20 Oct 2023" },
    { id: 2, tecnico: "Luis Perez", ruta: "Caracas - Maracay", monto: "$80.00", estado: "Aprobado", fecha: "18 Oct 2023" },
    { id: 3, tecnico: "Jose Gil", ruta: "Ruta Urbana (CCS)", monto: "$25.00", estado: "Pagado", fecha: "15 Oct 2023" },
]

export function ViaticosManager({
    userId,
    isCoordinator,
    initialViaticos,
    initialVisitas,
}: {
    userId: string
    isCoordinator: boolean
    initialViaticos: Viatico[]
    initialVisitas: VisitaMantenimiento[]
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Administración de Viáticos</h2>
                    <p className="text-sm text-slate-500">Gestión de presupuestos de viaje y ruta para mantenimientos.</p>
                </div>
                {!isCoordinator && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <FileText className="w-4 h-4 mr-2" />
                        Solicitar Viático
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3">Técnico / Solicitante</th>
                                    <th className="px-5 py-3">Ruta</th>
                                    <th className="px-5 py-3">Monto</th>
                                    <th className="px-5 py-3">Estado</th>
                                    {isCoordinator && <th className="px-5 py-3 text-right">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_VIATICOS.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-4 font-medium text-slate-800">{item.tecnico}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Car className="w-3.5 h-3.5 text-slate-400" />
                                                {item.ruta}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-mono text-slate-700">{item.monto}</td>
                                        <td className="px-5 py-4">
                                            <Badge variant="outline" className={
                                                item.estado === 'Aprobado' ? 'bg-blue-50 text-blue-700' :
                                                    item.estado === 'Pagado' ? 'bg-green-50 text-green-700' :
                                                        'bg-yellow-50 text-yellow-700'
                                            }>
                                                {item.estado}
                                            </Badge>
                                        </td>
                                        {isCoordinator && (
                                            <td className="px-5 py-4 text-right">
                                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50">
                                                    Revisar
                                                </Button>
                                            </td>
                                        )}
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
                                <div className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <span className="text-slate-600 text-sm">Presupuesto Q4</span>
                                    <span className="font-bold text-slate-800">$2,500.00</span>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
                                    <span className="text-blue-800 text-sm font-medium">Ejecutado (Aprobado)</span>
                                    <span className="font-bold text-blue-700">$840.00</span>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg flex justify-between items-center border border-amber-100">
                                    <span className="text-amber-800 text-sm font-medium">Por Aprobar</span>
                                    <span className="font-bold text-amber-700">$120.00</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    )
}
