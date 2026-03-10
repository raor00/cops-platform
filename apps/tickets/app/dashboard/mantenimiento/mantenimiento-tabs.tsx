"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, MapPin, ClipboardList, Wallet, Wrench } from "lucide-react"

// Subcomponents
import { CalendarioMantenimiento } from "./components/calendario-mantenimiento"
import { MisVisitas } from "./components/mis-visitas"
import { RutinasAdmin } from "./components/rutinas-admin"
import { DirectorioAgencias } from "./components/directorio-agencias"
import { ViaticosManager } from "./components/viaticos-manager"

interface MantenimientoTabsProps {
    userId: string
    isCoordinatorOrHigher: boolean
}

export function MantenimientoTabs({ userId, isCoordinatorOrHigher }: MantenimientoTabsProps) {
    const [activeTab, setActiveTab] = useState(isCoordinatorOrHigher ? "calendario" : "mis-visitas")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="bg-white border shadow-sm w-full justify-start h-auto flex-wrap p-1 gap-1">
                {isCoordinatorOrHigher && (
                    <TabsTrigger value="calendario" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Calendario Regional
                    </TabsTrigger>
                )}

                <TabsTrigger value="mis-visitas" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
                    <Wrench className="mr-2 h-4 w-4" />
                    Mis Visitas
                </TabsTrigger>

                <TabsTrigger value="viaticos" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
                    <Wallet className="mr-2 h-4 w-4" />
                    Viáticos
                </TabsTrigger>

                {isCoordinatorOrHigher && (
                    <>
                        <TabsTrigger value="rutinas" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
                            <ClipboardList className="mr-2 h-4 w-4" />
                            Gestión de Rutinas
                        </TabsTrigger>
                        <TabsTrigger value="agencias" className="data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">
                            <MapPin className="mr-2 h-4 w-4" />
                            Agencias BFC
                        </TabsTrigger>
                    </>
                )}
            </TabsList>

            <div className="flex-1 mt-4 overflow-y-auto pb-6">
                {isCoordinatorOrHigher && (
                    <TabsContent value="calendario" className="h-full m-0">
                        <CalendarioMantenimiento />
                    </TabsContent>
                )}

                <TabsContent value="mis-visitas" className="h-full m-0">
                    <MisVisitas userId={userId} />
                </TabsContent>

                <TabsContent value="viaticos" className="h-full m-0">
                    <ViaticosManager userId={userId} isCoordinator={isCoordinatorOrHigher} />
                </TabsContent>

                {isCoordinatorOrHigher && (
                    <>
                        <TabsContent value="rutinas" className="h-full m-0">
                            <RutinasAdmin />
                        </TabsContent>

                        <TabsContent value="agencias" className="h-full m-0">
                            <DirectorioAgencias />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs>
    )
}
