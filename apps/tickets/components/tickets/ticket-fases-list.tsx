"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react"

import { cn, formatDate } from "@/lib/utils"
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

interface TicketFasesListProps {
  ticketId: string
  fases: TicketFase[]
  canManage: boolean
  canUpdateProgress: boolean
}

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
    fase?.fecha_inicio_estimada ? fase.fecha_inicio_estimada.split("T")[0] : "",
  )
  const [fechaFinEst, setFechaFinEst] = useState(
    fase?.fecha_fin_estimada ? fase.fecha_fin_estimada.split("T")[0] : "",
  )
  const [estado, setEstado] = useState<string>(fase?.estado ?? "pendiente")
  const [progreso, setProgreso] = useState(String(fase?.progreso_porcentaje ?? 0))
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNombre(fase?.nombre ?? "")
      setDescripcion(fase?.descripcion ?? "")
      setFechaInicioEst(fase?.fecha_inicio_estimada ? fase.fecha_inicio_estimada.split("T")[0] : "")
      setFechaFinEst(fase?.fecha_fin_estimada ? fase.fecha_fin_estimada.split("T")[0] : "")
      setEstado(fase?.estado ?? "pendiente")
      setProgreso(String(fase?.progreso_porcentaje ?? 0))
    }

    onOpenChange(nextOpen)
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
            <Label>
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Ej: Relevamiento y Diseño"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>
              Descripción <span className="text-xs text-slate-400">(opcional)</span>
            </Label>
            <Textarea
              placeholder="Descripción detallada de esta fase..."
              value={descripcion}
              onChange={(event) => setDescripcion(event.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Inicio estimado</Label>
              <Input
                type="date"
                value={fechaInicioEst}
                onChange={(event) => setFechaInicioEst(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fin estimado</Label>
              <Input
                type="date"
                value={fechaFinEst}
                onChange={(event) => setFechaFinEst(event.target.value)}
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
                    {(Object.entries(FASE_LABELS) as [string, string][]).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
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
                  onChange={(event) => setProgreso(event.target.value)}
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
          <p className="text-sm font-medium text-slate-600">{fase.nombre}</p>

          <div className="space-y-2">
            <Label>Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(FASE_LABELS) as [string, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
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
              onChange={(event) => setProgreso(event.target.value)}
              disabled={estado === "completada"}
              className="accent-blue-400"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} isLoading={isLoading}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TicketFasesList({ ticketId, fases, canManage, canUpdateProgress }: TicketFasesListProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editingFase, setEditingFase] = useState<TicketFase | null>(null)
  const [progressFase, setProgressFase] = useState<TicketFase | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (fase: TicketFase) => {
    if (!confirm(`¿Eliminar la fase "${fase.nombre}"?`)) {
      return
    }

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
      case "completada":
        return "border-green-200"
      case "en_progreso":
        return "border-blue-200"
      case "cancelada":
        return "border-red-200"
      default:
        return "border-slate-200"
    }
  }

  const getDotColor = (estado: TicketFase["estado"]) => {
    switch (estado) {
      case "completada":
        return "bg-green-500"
      case "en_progreso":
        return "bg-blue-500"
      case "cancelada":
        return "bg-red-400"
      default:
        return "bg-slate-300"
    }
  }

  return (
    <div className="space-y-0">
      {fases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70 py-12 text-center">
          <p className="text-sm text-slate-600">Sin fases definidas</p>
          {canManage && <p className="mt-1 text-xs text-slate-500">Agrega la primera fase del proyecto</p>}
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute bottom-4 left-3 top-4 w-0.5 bg-slate-200" />

          {fases.map((fase, index) => (
            <div key={fase.id} className="relative mb-4 last:mb-0">
              <div
                className={cn(
                  "absolute -left-3 top-4 z-10 h-3 w-3 rounded-full border-2 border-white transition-colors duration-300",
                  getDotColor(fase.estado),
                )}
              />

              <div
                className={cn(
                  "ml-4 rounded-xl border bg-white p-4 shadow-sm transition-all duration-200",
                  getBorderColor(fase.estado),
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">#{index + 1}</span>
                      <span className="font-medium text-slate-900">{fase.nombre}</span>
                      <Badge className={cn("text-xs", FASE_COLORS[fase.estado])}>{FASE_LABELS[fase.estado]}</Badge>
                    </div>

                    {fase.descripcion && <p className="mt-1 text-sm text-slate-600">{fase.descripcion}</p>}

                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Progreso</span>
                        <span className="text-xs font-medium text-slate-600">{fase.progreso_porcentaje}%</span>
                      </div>

                      <div className="h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className="h-1.5 rounded-full bg-blue-400 transition-all duration-500"
                          style={{ width: `${fase.progreso_porcentaje}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      {fase.fecha_inicio_estimada && <span>Inicio est: {formatDate(fase.fecha_inicio_estimada)}</span>}
                      {fase.fecha_fin_estimada && <span>Fin est: {formatDate(fase.fecha_fin_estimada)}</span>}
                      {fase.fecha_inicio_real && (
                        <span className="text-blue-500/80">Inicio real: {formatDate(fase.fecha_inicio_real)}</span>
                      )}
                      {fase.fecha_fin_real && (
                        <span className="text-green-600/80">Fin real: {formatDate(fase.fecha_fin_real)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {canUpdateProgress && fase.estado !== "completada" && fase.estado !== "cancelada" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        onClick={() => setProgressFase(fase)}
                      >
                        <ChevronRight className="mr-1 h-3.5 w-3.5" />
                        Avanzar
                      </Button>
                    )}

                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          onClick={() => setEditingFase(fase)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-500 hover:text-red-400"
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

      {canManage && (
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full border-dashed border-slate-300 text-slate-600 hover:border-blue-500/40 hover:bg-blue-50 hover:text-slate-900"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Fase
          </Button>
        </div>
      )}

      <FaseFormDialog mode="create" ticketId={ticketId} open={formOpen} onOpenChange={setFormOpen} />

      {editingFase && (
        <FaseFormDialog
          mode="edit"
          ticketId={ticketId}
          fase={editingFase}
          open={!!editingFase}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingFase(null)
            }
          }}
        />
      )}

      {progressFase && (
        <UpdateProgressDialog
          fase={progressFase}
          ticketId={ticketId}
          open={!!progressFase}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setProgressFase(null)
            }
          }}
        />
      )}
    </div>
  )
}
