"use client"

import { Card } from "@/components/ui/card"

export function CalendarioMantenimiento() {
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Calendario Regional</h2>
            <p className="text-slate-500">
                Aquí se mostrará el calendario para programar mantenimientos por región (Trimestral).
            </p>
        </Card>
    )
}
