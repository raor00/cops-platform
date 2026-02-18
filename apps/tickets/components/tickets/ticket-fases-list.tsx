"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FaseCreateInput, FaseUpdateInput, TicketFase } from "@/types"
import { FASE_COLORS, FASE_LABELS } from "@/types"
import { createFase, updateFase, deleteFase } from "@/lib/actions/fases"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"

interface TicketFasesListProps {
  ticketId: string
  fases: TicketFase[]
  canManage: boolean
  canUpdateProgress: boolean
}

// ─── Form Dialog (crear / editar fase) ───────────────────────────────────────

interface FaseFormDialogProps {
  mode: "create" | "edit"
  ticketId: string
  fase?: TicketFase
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FaseFormDialog({ mode, ticketId, fase, open, onOpenChange }: FaseFormDialogProps) {
  const router = useRouter()
  const [nombre, setNombre] = useState(fase?.nombre ?? "")
  const [descripcion, setDescripcion] = useState(fase?.descripcion ?? "")
  const [fechaInicioEst, setFechaInicioEst] = useState(
    fase?.fecha_inicio_estimada ? fase.fecha_inicio_estimada.split("T")[0] : ""
  )
  const [fechaFinEst, setFechaFinEst] = useState(
    fase?.fecha_fin_estimada ? fase.fecha_fin_estimada.split("T")[0] : ""
  )
  const [estado, setEstado] = useState<string>(fase?.estado ?? "pendiente")
  const [progreso, setProgreso] = useState(String(fase?.progreso_porcentaje ?? 0))
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = (open: boolean) => {
    if (!open) {
      setNombre(fase?.nombre ?? "")
      setDescripcion(fase?.descripcion ?? "")
      setFechaInicioEst(fase?.fecha_inicio_estimada ? fase.fecha_inicio_estimada.split("T")[0] : "")
      setFechaFinEst(fase?.fecha_fin_estimada ? fase.fecha_fin_estimada.split("T")[0] : "")
      setEstado(fase?.estado ?? "pendiente")
      setProgreso(String(fase?.progreso_porcentaje ?? 0))
    }
    onOpenChange(open)
  }

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      toast.error("El nombre de la fase es requerido")
      return
    }
    setIsLoading(true)
    try {
      let result
      if (mode === "create") {
        const input: FaseCreateInput = {
          ticket_id: ticketId,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          fecha_inicio_estimada: fechaInicioEst ? new Date(fechaInicioEst).toISOString() : undefined,
          fecha_fin_estimada: fechaFinEst ? new Date(fechaFinEst).toISOString() : undefined,
        }
        result = await createFase(input)
      } else {
        const input: FaseUpdateInput = {
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || undefined,
          estado: estado as TicketFase["estado"],
          progreso_porcentaje: Math.min(100, Math.max(0, Number(progreso) || 0)),
          fecha_inicio_estimada: fechaInicioEst ? new Date(fechaInicioEst).toISOString() : undefined,
          fecha_fin_estimada: fechaFinEst ? new Date(fechaFinEst).toISOString() : undefined,
        }
        result = await updateFase(fase!.id, ticketId, input)
      }

      if (result.success) {
        toast.success(mode === "create" ? "Fase creada" : "Fase actualizada")
        handleClose(false)
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nueva Fase" : "Editar Fase"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre <span className="text-red-400">*</span></Label>
            <Input
              placeholder="Ej: Relevamiento y Diseño"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción <span className="text-white/40 text-xs">(opcional)</span></Label>
            <Textarea
              placeholder="Descripción detallada de esta fase..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Inicio estimado</Label>
              <Input
                type="date"
                value={fechaInicioEst}
                onChange={(e) => setFechaInicioEst(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin estimado</Label>
              <Input
                type="date"
                value={fechaFinEst}
                onChange={(e) => setFechaFinEst(e.target.value)}
              />
            </div>
          </div>

          {mode === "edit" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FASE_LABELS) as [string, string][]).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Progreso (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={progreso}
                  onChange={(e) => setProgreso(e.target.value)}
                  disabled={estado === "completada"}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={isLoading}>
            {mode === "create" ? "Crear Fase" : "Guardar Cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Progress Update Dialog (para técnicos) ──────────────────────────────────

interface UpdateProgressDialogProps {
  fase: TicketFase
  ticketId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function UpdateProgressDialog({ fase, ticketId, open, onOpenChange }: UpdateProgressDialogProps) {
  const router = useRouter()
  const [estado, setEstado] = useState<string>(fase.estado)
  const [progreso, setProgreso] = useState(String(fase.progreso_porcentaje))
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateFase(fase.id, ticketId, {
        estado: estado as TicketFase["estado"],
        progreso_porcentaje: Math.min(100, Math.max(0, Number(progreso) || 0)),
      })
      if (result.success) {
        toast.success("Progreso actualizado")
        onOpenChange(false)
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Actualizar Progreso</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-white/60 font-medium">{fase.nombre}</p>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(FASE_LABELS) as [string, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Progreso: {progreso}%</Label>
            <Input
              type="range"
              min={0}
              max={100}
              value={progreso}
              onChange={(e) => setProgreso(e.target.value)}
              disabled={estado === "completada"}
              className="accent-blue-400"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isLoading}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TicketFasesList({ ticketId, fases, canManage, canUpdateProgress }: TicketFasesListProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingFase, setEditingFase] = useState<TicketFase | null>(null)
  const [progressFase, setProgressFase] = useState<TicketFase | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (fase: TicketFase) => {
    if (!confirm(`¿Eliminar la fase "${fase.nombre}"?`)) return
    setDeletingId(fase.id)
    try {
      const result = await deleteFase(fase.id, ticketId)
      if (result.success) {
        toast.success("Fase eliminada")
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    } finally {
      setDeletingId(null)
    }
  }

  const getBorderColor = (estado: TicketFase["estado"]) => {
    switch (estado) {
      case "completada": return "border-green-500/60"
      case "en_progreso": return "border-blue-500/60"
      case "cancelada": return "border-red-500/40"
      default: return "border-white/20"
    }
  }

  const getDotColor = (estado: TicketFase["estado"]) => {
    switch (estado) {
      case "completada": return "bg-green-500"
      case "en_progreso": return "bg-blue-500"
      case "cancelada": return "bg-red-400"
      default: return "bg-white/30"
    }
  }

  return (
    <div className="space-y-0">
      {fases.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-white/10 text-center">
          <p className="text-white/50 text-sm">Sin fases definidas</p>
          {canManage && (
            <p className="text-white/30 text-xs mt-1">Agrega la primera fase del proyecto</p>
          )}
        </div>
      ) : (
        <div className="relative pl-6">
          {/* Vertical connecting line */}
          <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-white/10" />

          {fases.map((fase, idx) => (
            <div key={fase.id} className="relative mb-4 last:mb-0">
              {/* Dot */}
              <div
                className={cn(
                  "absolute -left-3 top-4 h-3 w-3 rounded-full border-2 border-[hsl(222,60%,24%)] z-10 transition-colors duration-300",
                  getDotColor(fase.estado)
                )}
              />

              {/* Card */}
              <div
                className={cn(
                  "ml-4 rounded-xl border p-4 bg-white/5 backdrop-blur-sm transition-all duration-200",
                  getBorderColor(fase.estado)
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-white/30 font-mono">#{idx + 1}</span>
                      <span className="font-medium text-white">{fase.nombre}</span>
                      <Badge className={cn("text-xs", FASE_COLORS[fase.estado])}>
                        {FASE_LABELS[fase.estado]}
                      </Badge>
                    </div>

                    {fase.descripcion && (
                      <p className="mt-1 text-sm text-white/50">{fase.descripcion}</p>
                    )}

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/40">Progreso</span>
                        <span className="text-xs text-white/60 font-medium">{fase.progreso_porcentaje}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10">
                        <div
                          className="h-1.5 rounded-full bg-blue-400 transition-all duration-500"
                          style={{ width: `${fase.progreso_porcentaje}%` }}
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
                      {fase.fecha_inicio_estimada && (
                        <span>Inicio est: {formatDate(fase.fecha_inicio_estimada)}</span>
                      )}
                      {fase.fecha_fin_estimada && (
                        <span>Fin est: {formatDate(fase.fecha_fin_estimada)}</span>
                      )}
                      {fase.fecha_inicio_real && (
                        <span className="text-blue-400/70">Inicio real: {formatDate(fase.fecha_inicio_real)}</span>
                      )}
                      {fase.fecha_fin_real && (
                        <span className="text-green-400/70">Fin real: {formatDate(fase.fecha_fin_real)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {canUpdateProgress && fase.estado !== "completada" && fase.estado !== "cancelada" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white/50 hover:text-white text-xs"
                        onClick={() => setProgressFase(fase)}
                      >
                        <ChevronRight className="h-3.5 w-3.5 mr-1" />
                        Avanzar
                      </Button>
                    )}
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-white"
                          onClick={() => setEditingFase(fase)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-white/40 hover:text-red-400"
                          onClick={() => handleDelete(fase)}
                          disabled={deletingId === fase.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add phase button */}
      {canManage && (
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full border-dashed border-white/20 text-white/50 hover:text-white hover:border-blue-500/40"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Fase
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <FaseFormDialog
        mode="create"
        ticketId={ticketId}
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {editingFase && (
        <FaseFormDialog
          mode="edit"
          ticketId={ticketId}
          fase={editingFase}
          open={!!editingFase}
          onOpenChange={(open) => { if (!open) setEditingFase(null) }}
        />
      )}

      {progressFase && (
        <UpdateProgressDialog
          fase={progressFase}
          ticketId={ticketId}
          open={!!progressFase}
          onOpenChange={(open) => { if (!open) setProgressFase(null) }}
        />
      )}
    </div>
  )
}
