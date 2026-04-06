"use client"

import Link from "next/link"
import {
  ClipboardCheck,
  GitBranch,
  History,
  FileSearch,
  Camera,
  BookOpen,
} from "lucide-react"
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
  canViewHistorial?: boolean
  userRole?: string
  currentUserId?: string
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
  canViewHistorial = false,
  userRole,
  currentUserId,
}: TicketDetailTabsProps) {
  const canAddLog =
    userRole === "tecnico"
      ? ticket.tecnico_id === currentUserId
      : userRole
        ? ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= 2
        : false

  const isProyecto = ticket.tipo === "proyecto"
  const isInspeccion = ticket.tipo === "inspeccion"
  const progresoGlobal =
    fases.length > 0
      ? Math.round(
          fases.reduce((sum, fase) => sum + fase.progreso_porcentaje, 0) / fases.length
        )
      : 0

  return (
    <Tabs defaultValue="detalle" className="w-full">
      <TabsList className="mb-6 flex-wrap">
        <TabsTrigger value="detalle">
          <ClipboardCheck className="mr-1.5 h-4 w-4" />
          Detalle
        </TabsTrigger>

        {isProyecto && (
          <TabsTrigger value="fases">
            <GitBranch className="mr-1.5 h-4 w-4" />
            Fases
            {fases.length > 0 && (
              <span className="ml-1.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {fases.length}
              </span>
            )}
          </TabsTrigger>
        )}

        <TabsTrigger value="fotos">
          <Camera className="mr-1.5 h-4 w-4" />
          Fotos
        </TabsTrigger>

        <TabsTrigger value="bitacora">
          <BookOpen className="mr-1.5 h-4 w-4" />
          Bitácora
          {updateLogs.length > 0 && (
            <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
              {updateLogs.length}
            </span>
          )}
        </TabsTrigger>

        {canViewHistorial && (
          <TabsTrigger value="historial">
            <History className="mr-1.5 h-4 w-4" />
            Historial
          </TabsTrigger>
        )}

        {!isInspeccion && (
          <TabsTrigger value="inspeccion">
            <FileSearch className="mr-1.5 h-4 w-4" />
            Inspección
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="detalle">
        {isProyecto && fases.length > 0 && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 animate-fade-in">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">
                Progreso global del proyecto
              </span>
              <span className="text-sm font-bold text-slate-900">{progresoGlobal}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  "progress-fill h-2 rounded-full",
                  progresoGlobal === 100 ? "bg-green-500" : "bg-blue-500"
                )}
                style={{ width: `${progresoGlobal}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {fases.filter((fase) => fase.estado === "completada").length} de{" "}
              {fases.length} fases completadas
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

      {/* ── Bitácora: seguimiento y notas de avance (todos los roles) ── */}
      <TabsContent value="bitacora">
        <UpdateLogPanel
          ticketId={ticket.id}
          ticketStatus={ticket.estado}
          initialLogs={updateLogs}
          canAdd={canAddLog}
          canUploadPhotos={canUploadFotos}
        />
      </TabsContent>

      {/* ── Historial: cambios de estado automáticos (coordinador+) ── */}
      {canViewHistorial && (
        <TabsContent value="historial">
          {historial.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Sin cambios registrados.</p>
          ) : (
            <div className="space-y-2">
              {historial.map((entry, index) => (
                <div
                  key={entry.id}
                  className="animate-slide-up rounded-xl border border-slate-200 bg-white p-3 transition-colors hover:bg-slate-50"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="flex gap-4">
                    <div className="w-32 shrink-0 pt-0.5 text-xs text-slate-400">
                      {formatDateTime(entry.created_at)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {CHANGE_TYPE_LABELS[entry.tipo_cambio] ?? entry.tipo_cambio}
                      </p>
                      {entry.observacion && (
                        <p className="mt-0.5 truncate text-xs text-slate-500">{entry.observacion}</p>
                      )}
                      {entry.valor_anterior && entry.valor_nuevo && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {entry.valor_anterior} → {entry.valor_nuevo}
                        </p>
                      )}
                      {entry.usuario && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          por {entry.usuario.nombre} {entry.usuario.apellido}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      )}

      {!isInspeccion && (
        <TabsContent value="inspeccion">
          {inspeccion ? (
            <div className="animate-fade-in space-y-3 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900">Inspección registrada</h3>
                <span className="text-xs text-slate-500">
                  {formatDateTime(inspeccion.fecha_inspeccion)}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Estado:{" "}
                <span className="font-medium capitalize text-slate-800">
                  {inspeccion.estado}
                </span>
              </p>
              <p className="text-sm text-slate-500">
                Este ticket no permite crear ni editar inspecciones. Solo lectura por
                registro legacy.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/tickets/${ticket.id}/inspeccion/view`}>
                  Ver inspección completa
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
              <FileSearch className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">
                Ticket iniciado sin inspección
              </p>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                La inspección solo se crea desde tickets tipo inspección en el flujo
                inicial.
              </p>
            </div>
          )}
        </TabsContent>
      )}
    </Tabs>
  )
}
