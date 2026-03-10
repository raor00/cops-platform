"use client"

import { Card } from "@/components/ui/card"

interface MisVisitasProps {
    userId: string
}

export function MisVisitas({ userId }: MisVisitasProps) {
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Mis Visitas Asignadas</h2>
            <p className="text-slate-500">
                Listado de agencias asignadas para mantenimiento preventivo.
            </p>
        </Card>
    )
}
