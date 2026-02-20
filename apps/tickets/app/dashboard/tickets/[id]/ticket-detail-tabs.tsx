"use client"

import Link from "next/link"
import { ClipboardCheck, GitBranch, History, FileSearch, Camera } from "lucide-react"
import { cn, formatDateTime } from "@/lib/utils"
import type { ChangeHistory, Inspeccion, Ticket, TicketFase, UpdateLog } from "@/types"
import { CHANGE_TYPE_LABELS, ROLE_HIERARCHY } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TicketDetails } from "./ticket-details"
import { TicketFasesList } from "@/components/tickets/ticket-fases-list"
import { FotosGallery } from "@/components/fotos/fotos-gallery"
import { UpdateLogPanel } from "@/components/tickets/update-log-panel"

interface TicketDetailTabsProps {
  ticket: Ticket
  fases: TicketFase[]
  historial: ChangeHistory[]
  inspeccion: Inspeccion | null
  updateLogs?: UpdateLog[]
  canManageFases: boolean
  canUpdateProgress: boolean
  canUploadFotos?: boolean
  canDeleteFotos?: boolean
  userRole?: string
}

export function TicketDetailTabs({
  ticket,
  fases,
  historial,
  inspeccion,
  updateLogs = [],
  canManageFases,
  canUpdateProgress,
  canUploadFotos = false,
  canDeleteFotos = false,
  userRole,
}: TicketDetailTabsProps) {
  const canAddLog =
    userRole === "tecnico"
      ? ticket.tecnico_id !== null
      : userRole
        ? ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= 2
        : false

  const isProyecto = ticket.tipo === "proyecto"
  const isInspeccion = ticket.tipo === "inspeccion"

  const progresoGlobal =
    fases.length > 0
      ? Math.round(fases.reduce((sum, fase) => sum + fase.progreso_porcentaje, 0) / fases.length)
      : 0

  return (
    <Tabs defaultValue="detalle" className="w-full">
      <TabsList className="mb-6 flex-wrap">
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

        <TabsTrigger value="fotos">
          <Camera className="h-4 w-4 mr-1.5" />
          Fotos
        </TabsTrigger>

        <TabsTrigger value="historial">
          <History className="h-4 w-4 mr-1.5" />
          Historial
        </TabsTrigger>

        {!isInspeccion && (
          <TabsTrigger value="inspeccion">
            <FileSearch className="h-4 w-4 mr-1.5" />
            Inspeccion
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="detalle">
        {isProyecto && fases.length > 0 && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">Progreso global del proyecto</span>
              <span className="text-sm font-bold text-white">{progresoGlobal}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-2 rounded-full progress-fill",
                  progresoGlobal === 100 ? "bg-green-400" : "bg-blue-400"
                )}
                style={{ width: `${progresoGlobal}%` }}
              />
            </div>
            <p className="text-xs text-white/40 mt-2">
              {fases.filter((fase) => fase.estado === "completada").length} de {fases.length} fases completadas
            </p>
          </div>
        )}
        <TicketDetails ticket={ticket} />
      </TabsContent>

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

      <TabsContent value="fotos">
        <FotosGallery
          ticketId={ticket.id}
          canUpload={canUploadFotos}
          canDelete={canDeleteFotos}
        />
      </TabsContent>

      <TabsContent value="historial">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              Actualizaciones del servicio
            </h3>
            <UpdateLogPanel
              ticketId={ticket.id}
              ticketStatus={ticket.estado}
              initialLogs={updateLogs}
              canAdd={canAddLog}
            />
          </div>

          {historial.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                Historial de cambios
              </h3>
              <div className="space-y-2">
                {historial.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/10 transition-colors hover:bg-white/[0.07] animate-slide-up"
                    style={{ animationDelay: `${index * 40}ms` }}
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
                          {entry.valor_anterior} -&gt; {entry.valor_nuevo}
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
            </div>
          )}
        </div>
      </TabsContent>

      {!isInspeccion && (
        <TabsContent value="inspeccion">
          {inspeccion ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">Inspeccion registrada</h3>
                <span className="text-xs text-white/40">{formatDateTime(inspeccion.fecha_inspeccion)}</span>
              </div>
              <p className="text-sm text-white/60">
                Estado: <span className="capitalize font-medium text-white/80">{inspeccion.estado}</span>
              </p>
              <p className="text-sm text-white/55">
                Este ticket no permite crear ni editar inspecciones. Solo lectura por registro legacy.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tickets/${ticket.id}/inspeccion/view`}>
                  Ver inspeccion completa
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <FileSearch className="h-10 w-10 text-white/20 mb-3" />
              <p className="text-white/70 text-sm font-medium">Ticket iniciado sin inspeccion</p>
              <p className="text-white/45 text-sm mt-2 max-w-md">
                La inspeccion solo se crea desde tickets tipo inspeccion en el flujo inicial.
              </p>
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  )
}