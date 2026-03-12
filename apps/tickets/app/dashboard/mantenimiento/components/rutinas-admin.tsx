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

const INITIAL_MOCK_RUTINAS = [
    { id: 1, titulo: "Mantenimiento Trimestral Q1 2024", periodo: "Ene - Mar 2024", progreso: 85, estado: "En Ejecución" },
    { id: 2, titulo: "Mantenimiento Trimestral Q4 2023", periodo: "Oct - Dic 2023", progreso: 100, estado: "Finalizado" },
    { id: 3, titulo: "Mantenimiento Trimestral Q2 2024", periodo: "Abr - Jun 2024", progreso: 0, estado: "Planificación" },
]

export function RutinasAdmin({
    initialRutinas,
    initialAgencias,
}: {
    initialRutinas: RutinaMantenimiento[]
    initialAgencias: Agencia[]
}) {
    const [rutinas, setRutinas] = useState(INITIAL_MOCK_RUTINAS)

    // Form state
    const [open, setOpen] = useState(false)
    const [newTitulo, setNewTitulo] = useState("")
    const [newTrimestre, setNewTrimestre] = useState("")
    const [newAnio, setNewAnio] = useState(new Date().getFullYear().toString())

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()

        let periodoStr = ""
        if (newTrimestre === "Q1") periodoStr = `Ene - Mar ${newAnio}`
        if (newTrimestre === "Q2") periodoStr = `Abr - Jun ${newAnio}`
        if (newTrimestre === "Q3") periodoStr = `Jul - Sep ${newAnio}`
        if (newTrimestre === "Q4") periodoStr = `Oct - Dic ${newAnio}`

        const newRutina = {
            id: Date.now(),
            titulo: newTitulo || `Mantenimiento Trimestral ${newTrimestre} ${newAnio}`,
            periodo: periodoStr,
            progreso: 0,
            estado: "Planificación"
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
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                            <span>Región Capital (18)</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                            <span>Interior del País (26)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label>Elementos a Revisar</Label>
                                    <div className="flex flex-col gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50 h-[88px] overflow-y-auto sidebar-scroll-hide">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                            <span>CCTV / DVRs</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                            <span>Sistemas de Alarma</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                                            <span>Bóvedas y Esclusas</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                            <span>Cercos Eléctricos</span>
                                        </label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rutinas.map(rutina => (
                    <Card key={rutina.id} className="p-5 border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <CalendarRange className="w-5 h-5 text-blue-600" />
                            </div>
                            <Badge variant="outline" className={
                                rutina.estado === "Finalizado" ? "bg-slate-100 text-slate-600 border-slate-200" :
                                    rutina.estado === "En Ejecución" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                        "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }>
                                {rutina.estado}
                            </Badge>
                        </div>

                        <h3 className="font-semibold text-slate-800 text-lg mb-1">{rutina.titulo}</h3>
                        <p className="text-slate-500 text-sm mb-6 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {rutina.periodo}
                        </p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 font-medium">Progreso Global</span>
                                <span className="text-slate-800 font-bold">{rutina.progreso}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${rutina.progreso === 100 ? "bg-slate-400" : "bg-blue-500"}`}
                                    style={{ width: `${rutina.progreso}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200">
                                Ver Detalles
                            </Button>
                            {rutina.estado !== "Finalizado" && (
                                <Button size="sm" className="bg-slate-800 hover:bg-slate-900 text-white">
                                    Gestionar
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
