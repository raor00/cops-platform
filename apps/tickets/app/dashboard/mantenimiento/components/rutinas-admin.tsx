"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, CalendarRange, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Agencia, RutinaMantenimiento } from "@/types"

const ESTADO_LABELS: Record<string, string> = {
    borrador: "Borrador",
    programada: "Planificación",
    en_curso: "En Ejecución",
    finalizada: "Finalizado",
}

function getEstadoBadgeClass(estado: string) {
    if (estado === "finalizada") return "bg-slate-100 text-slate-600 border-slate-200"
    if (estado === "en_curso") return "bg-blue-50 text-blue-700 border-blue-200"
    return "bg-yellow-50 text-yellow-700 border-yellow-200"
}

function getPeriodoLabel(rutina: RutinaMantenimiento) {
    const trimestres: Record<number, string> = {
        1: "Ene - Mar",
        2: "Abr - Jun",
        3: "Jul - Sep",
        4: "Oct - Dic",
    }
    const rango = trimestres[rutina.trimestre] ?? `Q${rutina.trimestre}`
    return `${rango} ${rutina.anio}`
}

export function RutinasAdmin({
    initialRutinas,
    initialAgencias,
}: {
    initialRutinas: RutinaMantenimiento[]
    initialAgencias: Agencia[]
}) {
    const [rutinas, setRutinas] = useState<RutinaMantenimiento[]>(initialRutinas)

    // Form state
    const [open, setOpen] = useState(false)
    const [newTitulo, setNewTitulo] = useState("")
    const [newTrimestre, setNewTrimestre] = useState("")
    const [newAnio, setNewAnio] = useState(new Date().getFullYear().toString())

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()

        const trimNum = parseInt(newTrimestre.replace("Q", ""), 10)
        const anioNum = parseInt(newAnio, 10)

        const newRutina: RutinaMantenimiento = {
            id: crypto.randomUUID(),
            titulo: newTitulo || `Mantenimiento Trimestral Q${trimNum} ${anioNum}`,
            trimestre: trimNum,
            anio: anioNum,
            fecha_inicio: null,
            fecha_fin: null,
            regiones: [],
            equipos_objetivo: [],
            presupuesto_viaticos: null,
            creado_por: null,
            estado: "borrador",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        setRutinas([newRutina, ...rutinas])
        setOpen(false)
        setNewTitulo("")
        setNewTrimestre("")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-800">Gestión de Ciclos y Rutinas</h2>
                    <p className="text-sm text-slate-500">Crea los bloques trimestrales de mantenimiento preventivo.</p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Nuevo Ciclo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crear Ciclo de Mantenimiento</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título Analítico (Opcional)</Label>
                                <Input id="titulo" placeholder="Ej. Preventivo Global" value={newTitulo} onChange={e => setNewTitulo(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="trimestre">Trimestre</Label>
                                    <Select value={newTrimestre} onValueChange={setNewTrimestre} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Periodo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Q1">Q1 (Ene - Mar)</SelectItem>
                                            <SelectItem value="Q2">Q2 (Abr - Jun)</SelectItem>
                                            <SelectItem value="Q3">Q3 (Jul - Sep)</SelectItem>
                                            <SelectItem value="Q4">Q4 (Oct - Dic)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="anio">Año</Label>
                                    <Input id="anio" type="number" min="2020" max="2050" value={newAnio} onChange={e => setNewAnio(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label>Agencias Objetivo</Label>
                                    <div className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                                        {initialAgencias.length > 0 ? (
                                            initialAgencias.slice(0, 4).map((agencia) => (
                                                <label key={agencia.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                    <span>{agencia.nombre}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-400">Sin agencias disponibles</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Elementos a Revisar</Label>
                                    <div className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50 h-[88px] overflow-y-auto sidebar-scroll-hide">
                                        {["CCTV / DVRs", "Sistemas de Alarma", "Bóvedas y Esclusas", "Cercos Eléctricos"].map((eq) => (
                                            <label key={eq} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <span>{eq}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="presupuesto">Presupuesto Estimado Viáticos (Ref)</Label>
                                <Input id="presupuesto" type="number" placeholder="Ej. 1500" />
                            </div>

                            <DialogFooter className="pt-4">
                                <DialogClose asChild>
                                    <Button variant="outline" type="button" className="text-slate-700 border-slate-300 hover:bg-slate-100">Cancelar</Button>
                                </DialogClose>
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Generar Ciclo</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {rutinas.length === 0 ? (
                <Card className="border-slate-200 bg-white p-12 text-center">
                    <CalendarRange className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Sin ciclos registrados</p>
                    <p className="text-slate-400 text-sm mt-1">Crea el primer ciclo de mantenimiento trimestral.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rutinas.map(rutina => (
                        <Card key={rutina.id} className="p-5 border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <CalendarRange className="w-5 h-5 text-blue-600" />
                                </div>
                                <Badge variant="outline" className={getEstadoBadgeClass(rutina.estado)}>
                                    {ESTADO_LABELS[rutina.estado] ?? rutina.estado}
                                </Badge>
                            </div>

                            <h3 className="font-semibold text-slate-800 text-lg mb-1">{rutina.titulo}</h3>
                            <p className="text-slate-500 text-sm mb-4 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {getPeriodoLabel(rutina)}
                            </p>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
