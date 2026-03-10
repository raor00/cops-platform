"use client"

import { Card } from "@/components/ui/card"

interface ViaticosManagerProps {
    userId: string
    isCoordinator: boolean
}

export function ViaticosManager({ userId, isCoordinator }: ViaticosManagerProps) {
    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Gestión de Viáticos</h2>
            <p className="text-slate-500">
                {isCoordinator
                    ? "Aprobación y revisión de viáticos."
                    : "Registro y solicitud de viáticos para viajes."}
            </p>
        </Card>
    )
}
