"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wrench, Calendar, MapPin, Camera, ClipboardCheck, AlertTriangle } from "lucide-react"

const MOCK_VISITAS = [
    { id: 1, agencia: "Agencia Principal Torre BFC", fecha: "15 Oct 2023", estado: "Asignada", urgencia: "Alta" },
    { id: 2, agencia: "Agencia Chacao", fecha: "18 Oct 2023", estado: "En Progreso", urgencia: "Media" },
    { id: 3, agencia: "Agencia Las Mercedes", fecha: "12 Oct 2023", estado: "Completada", urgencia: "Alta" },
]

export function MisVisitas({ userId }: { userId: string }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Mis Visitas Asignadas</h2>
                    <p className="text-sm text-slate-500">Ejecuta el mantenimiento y llena el reporte en sitio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {MOCK_VISITAS.map(visita => (
                    <Card key={visita.id} className={`p-5 border-l-4 transition-all hover:shadow-md ${visita.estado === 'Completada' ? 'border-l-green-500' :
                            visita.estado === 'En Progreso' ? 'border-l-blue-500' :
                                'border-l-orange-500'
                        }`}>
                        <div className="flex justify-between items-start mb-4">
                            <Badge variant="outline" className={
                                visita.estado === 'Completada' ? 'bg-green-50 text-green-700' :
                                    visita.estado === 'En Progreso' ? 'bg-blue-50 text-blue-700' :
                                        'bg-orange-50 text-orange-700'
                            }>
                                {visita.estado}
                            </Badge>
                            {visita.urgencia === 'Alta' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>

                        <h3 className="font-semibold text-slate-800 text-lg leading-tight mb-2">{visita.agencia}</h3>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {visita.fecha}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Caracas, Distrito Capital
                            </div>
                        </div>

                        {visita.estado === 'Completada' ? (
                            <Button className="w-full bg-slate-100 hover:bg-slate-200 justify-center text-slate-700">
                                <ClipboardCheck className="w-4 h-4 mr-2" />
                                Ver Reporte Generado
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                    <Wrench className="w-4 h-4 mr-2" />
                                    {visita.estado === 'En Progreso' ? 'Continuar' : 'Iniciar Visita'}
                                </Button>
                                <Button variant="outline" size="icon" className="border-slate-200 text-slate-600">
                                    <Camera className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    )
}
