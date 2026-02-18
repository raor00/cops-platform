"use client"

import Link from "next/link"
import { ClipboardCheck, GitBranch, History, FileSearch } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/utils"
import type { ChangeHistory, Inspeccion, Ticket, TicketFase } from "@/types"
import { CHANGE_TYPE_LABELS } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TicketDetails } from "./ticket-details"
import { TicketFasesList } from "@/components/tickets/ticket-fases-list"

interface TicketDetailTabsProps {
  ticket: Ticket
  fases: TicketFase[]
  historial: ChangeHistory[]
  inspeccion: Inspeccion | null
  canManageFases: boolean
  canUpdateProgress: boolean
}

export function TicketDetailTabs({
  ticket,
  fases,
  historial,
  inspeccion,
  canManageFases,
  canUpdateProgress,
}: TicketDetailTabsProps) {
  const isProyecto = ticket.tipo === "proyecto"

  // Progreso global calculado desde las fases
  const progresoGlobal =
    fases.length > 0
      ? Math.round(fases.reduce((sum, f) => sum + f.progreso_porcentaje, 0) / fases.length)
      : 0

  return (
    <Tabs defaultValue="detalle" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="detalle">
          <ClipboardCheck className="h-4 w-4 mr-1.5" />
          Detalle
        </TabsTrigger>
        {isProyecto && (
          <TabsTrigger value="fases">
            <GitBranch className="h-4 w-4 mr-1.5" />
            Fases
            {fases.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-blue-300">
                {fases.length}
              </span>
            )}
          </TabsTrigger>
        )}
        <TabsTrigger value="historial">
          <History className="h-4 w-4 mr-1.5" />
          Historial
        </TabsTrigger>
        <TabsTrigger value="inspeccion">
          <FileSearch className="h-4 w-4 mr-1.5" />
          Inspección
        </TabsTrigger>
      </TabsList>

      {/* ─── Tab: Detalle ─────────────────────────────────────────────────── */}
      <TabsContent value="detalle">
        {isProyecto && fases.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">Progreso Global del Proyecto</span>
              <span className="text-sm font-bold text-white">{progresoGlobal}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  progresoGlobal === 100 ? "bg-green-400" : "bg-blue-400"
                )}
                style={{ width: `${progresoGlobal}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              {fases.filter((f) => f.estado === "completada").length} de {fases.length} fases completadas
            </p>
          </div>
        )}
        <TicketDetails ticket={ticket} />
      </TabsContent>

      {/* ─── Tab: Fases (solo proyectos) ──────────────────────────────────── */}
      {isProyecto && (
        <TabsContent value="fases">
          <TicketFasesList
            ticketId={ticket.id}
            fases={fases}
            canManage={canManageFases}
            canUpdateProgress={canUpdateProgress}
          />
        </TabsContent>
      )}

      {/* ─── Tab: Historial ───────────────────────────────────────────────── */}
      <TabsContent value="historial">
        {historial.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm">Sin historial de cambios registrados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {historial.map((entry) => (
              <div
                key={entry.id}
                className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="text-xs text-white/35 w-32 shrink-0 pt-0.5">
                  {formatDateTime(entry.created_at)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 font-medium">
                    {CHANGE_TYPE_LABELS[entry.tipo_cambio] ?? entry.tipo_cambio}
                  </p>
                  {entry.observacion && (
                    <p className="text-xs text-white/50 mt-0.5 truncate">{entry.observacion}</p>
                  )}
                  {entry.valor_anterior && entry.valor_nuevo && (
                    <p className="text-xs text-white/35 mt-0.5">
                      {entry.valor_anterior} → {entry.valor_nuevo}
                    </p>
                  )}
                  {entry.usuario && (
                    <p className="text-xs text-white/30 mt-0.5">
                      por {entry.usuario.nombre} {entry.usuario.apellido}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>

      {/* ─── Tab: Inspección ──────────────────────────────────────────────── */}
      <TabsContent value="inspeccion">
        {inspeccion ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">Inspección registrada</h3>
              <span className="text-xs text-white/40">{formatDateTime(inspeccion.fecha_inspeccion)}</span>
            </div>
            <p className="text-sm text-white/60">
              Estado:{" "}
              <span className="capitalize font-medium text-white/80">{inspeccion.estado}</span>
            </p>
            {inspeccion.observaciones_generales && (
              <p className="text-sm text-white/60">{inspeccion.observaciones_generales}</p>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/tickets/${ticket.id}/inspeccion`}>
                Ver Inspección Completa
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileSearch className="h-10 w-10 text-white/20 mb-3" />
            <p className="text-white/50 text-sm mb-4">No hay inspección registrada para este ticket</p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/tickets/${ticket.id}/inspeccion`}>
                Crear Inspección
              </Link>
            </Button>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
