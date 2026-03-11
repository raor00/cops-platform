"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileBarChart2, Download, Filter, TrendingUp, Calendar as CalIcon, MapPin } from "lucide-react"

export function ReportesMantenimiento() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Informes y Reportes</h2>
                    <p className="text-sm text-slate-500">Genera y exporta el estatus general y bitácoras de los equipos usados.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-slate-200 text-slate-700 bg-white">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros
                    </Button>
                    <Button className="bg-slate-800 hover:bg-slate-900 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar General (Excel)
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Agencias Atendidas</p>
                            <h3 className="text-2xl font-bold text-slate-800">18 <span className="text-sm font-normal text-slate-400">/ 44</span></h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-xl">
                            <FileBarChart2 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Equipos Sustituidos</p>
                            <h3 className="text-2xl font-bold text-slate-800">42 Unds</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-xl">
                            <CalIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Días en Ruta</p>
                            <h3 className="text-2xl font-bold text-slate-800">14 Días</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800">Últimos Reportes de Técnicos</h3>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-5 py-3">Agencia</th>
                            <th className="px-5 py-3">Técnico</th>
                            <th className="px-5 py-3">Fecha</th>
                            <th className="px-5 py-3">Repuestos Usados</th>
                            <th className="px-5 py-3 text-right">Documento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[1, 2, 3].map((item) => (
                            <tr key={item} className="hover:bg-slate-50/50">
                                <td className="px-5 py-4 font-medium text-slate-800">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        Agencia Central {item}
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-slate-600">Omar Lopez</td>
                                <td className="px-5 py-4 text-slate-600">12 Oct 2023</td>
                                <td className="px-5 py-4 text-slate-600">2x DVR, 1x Batería</td>
                                <td className="px-5 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                                        <Download className="w-4 h-4 mr-2" />
                                        PDF
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

        </div>
    )
}
