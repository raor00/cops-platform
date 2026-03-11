import { Suspense } from "react"
import { redirect } from "next/navigation"
import { ROLE_HIERARCHY } from "@/types"
import { MantenimientoTabs } from "./mantenimiento-tabs"
import { getCurrentUser } from "@/lib/actions/auth"
import {
    getAgencias,
    getMaintenanceTechnicians,
    getMantenimientoReportes,
    getMisVisitas,
    getRutinas,
    getViaticos,
    getVisitasMantenimiento,
} from "@/lib/actions/mantenimiento"

export const metadata = {
    title: "Mantenimientos | COPS Tickets",
    description: "Programación y ejecución de mantenimiento preventivo",
}

export default async function MantenimientoPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect("/auth/login")
    }

    const isCoordinatorOrHigher = ROLE_HIERARCHY[user.rol] >= 2
    const [agenciasResult, rutinasResult, viaticosResult, misVisitasResult, visitasResult, reportesResult, techniciansResult] = await Promise.all([
        isCoordinatorOrHigher ? getAgencias() : Promise.resolve({ success: true, data: [] }),
        isCoordinatorOrHigher ? getRutinas() : Promise.resolve({ success: true, data: [] }),
        getViaticos(),
        getMisVisitas(),
        isCoordinatorOrHigher ? getVisitasMantenimiento() : Promise.resolve({ success: true, data: [] }),
        isCoordinatorOrHigher ? getMantenimientoReportes() : Promise.resolve({ success: true, data: undefined }),
        isCoordinatorOrHigher ? getMaintenanceTechnicians() : Promise.resolve({ success: true, data: [] }),
    ])

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-4 md:p-6 lg:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                        Mantenimiento Preventivo
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Programación, ejecución y viáticos de mantenimientos trimestrales BFC.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
                    <MantenimientoTabs
                        userId={user.id}
                        isCoordinatorOrHigher={isCoordinatorOrHigher}
                        initialAgencias={agenciasResult.data ?? []}
                        initialRutinas={rutinasResult.data ?? []}
                        initialViaticos={viaticosResult.data ?? []}
                        initialMisVisitas={misVisitasResult.data ?? []}
                        initialVisitas={visitasResult.data ?? []}
                        initialReportes={reportesResult.data}
                        initialTechnicians={techniciansResult.data ?? []}
                    />
                </Suspense>
            </div>
        </div>
    )
}
