"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquarePlus, Loader2, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { addTicketUpdateLog } from "@/lib/actions/tickets"
import { formatRelativeTime } from "@/lib/utils"
import { ROLE_LABELS } from "@/types"
import type { UpdateLog, TicketStatus } from "@/types"
import { cn } from "@/lib/utils"

interface UpdateLogPanelProps {
  ticketId: string
  ticketStatus: TicketStatus
  initialLogs: UpdateLog[]
  canAdd: boolean
}

export function UpdateLogPanel({ ticketId, ticketStatus, initialLogs, canAdd }: UpdateLogPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [contenido, setContenido] = useState("")
  const [logs, setLogs] = useState<UpdateLog[]>(initialLogs)

  const isActive = ticketStatus !== "finalizado" && ticketStatus !== "cancelado"

  const handleSubmit = async () => {
    if (!contenido.trim()) return

    startTransition(async () => {
      const result = await addTicketUpdateLog(ticketId, contenido)
      if (result.success && result.data) {
        setLogs((prev) => [result.data!, ...prev])
        setContenido("")
        toast.success("Actualización agregada")
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Input area — solo cuando está activo y el usuario puede añadir */}
      {canAdd && isActive && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Agregar actualización
          </p>
          <Textarea
            placeholder="Describe el avance, observación o novedad del servicio..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!contenido.trim() || isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MessageSquarePlus className="h-4 w-4 mr-2" />
              )}
              Publicar
            </Button>
          </div>
        </div>
      )}

      {/* Timeline de logs */}
      {logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
          <FileText className="h-8 w-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">Sin actualizaciones registradas</p>
          {canAdd && isActive && (
            <p className="text-xs text-white/25 mt-1">Agrega la primera actualización del servicio</p>
          )}
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Línea vertical del timeline */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />

          {logs.map((log, i) => (
            <div
              key={log.id}
              className={cn(
                "relative pl-9 pb-4 animate-fade-in",
                `stagger-${Math.min(i + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}`
              )}
            >
              {/* Punto del timeline */}
              <div className={cn(
                "absolute left-0 top-1.5 h-[14px] w-[14px] rounded-full border-2 flex-shrink-0",
                log.tipo === "cambio_estado"
                  ? "border-sky-400 bg-sky-400/20"
                  : "border-white/30 bg-white/10"
              )} />

              {/* Contenido */}
              <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {/* Avatar iniciales */}
                    <div className="h-5 w-5 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-[9px] font-bold text-sky-300 shrink-0">
                      {log.autor
                        ? `${log.autor.nombre.charAt(0)}${log.autor.apellido.charAt(0)}`
                        : "?"}
                    </div>
                    <span className="text-xs font-medium text-white/70 truncate">
                      {log.autor
                        ? `${log.autor.nombre} ${log.autor.apellido}`
                        : "Sistema"}
                    </span>
                    {log.autor && (
                      <span className="text-[10px] text-white/35 shrink-0">
                        ({ROLE_LABELS[log.autor.rol]})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-white/30 shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(log.created_at)}
                  </div>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{log.contenido}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
