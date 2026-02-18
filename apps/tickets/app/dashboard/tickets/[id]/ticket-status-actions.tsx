"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Play, CheckCircle, XCircle, Loader2, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { changeTicketStatus } from "@/lib/actions/tickets"
import { cn, formatMinutesToDuration } from "@/lib/utils"
import type { MaterialItem, Ticket, TicketStatus } from "@/types"
import { VALID_TRANSITIONS } from "@/types"

interface TicketStatusActionsProps {
  ticket: Ticket
}

export function TicketStatusActions({ ticket }: TicketStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [materiales, setMateriales] = useState<MaterialItem[]>(
    ticket.materiales_planificados ?? []
  )
  const [tiempoTrabajado, setTiempoTrabajado] = useState("")
  const [solucion, setSolucion] = useState("")
  const [observaciones, setObservaciones] = useState("")

  const validTransitions = VALID_TRANSITIONS[ticket.estado]
  const isFinalized = ticket.estado === "finalizado" || ticket.estado === "cancelado"

  const resetWizard = () => {
    setStep(1)
    setMateriales(ticket.materiales_planificados ?? [])
    setTiempoTrabajado("")
    setSolucion("")
    setObservaciones("")
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) resetWizard()
    setDialogOpen(open)
  }

  // Simple single-click status change (no dialog)
  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === "finalizado") {
      setDialogOpen(true)
      return
    }
    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticket.id, newStatus)
      if (result.success) {
        toast.success("Estado actualizado", { description: result.message })
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    } catch {
      toast.error("Error", { description: "Ocurrió un error inesperado" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!solucion.trim()) {
      toast.error("La solución aplicada es requerida")
      return
    }
    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticket.id, "finalizado", {
        materiales_usados: materiales.filter((m) => m.nombre.trim()),
        tiempo_trabajado: tiempoTrabajado ? parseInt(tiempoTrabajado) : undefined,
        solucion_aplicada: solucion,
        observaciones_tecnico: observaciones || undefined,
      })
      if (result.success) {
        toast.success("Ticket finalizado", { description: result.message })
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error("Error", { description: result.error })
      }
    } catch {
      toast.error("Error", { description: "Ocurrió un error inesperado" })
    } finally {
      setIsLoading(false)
    }
  }

  // Material row helpers
  const addMaterial = () => {
    setMateriales([
      ...materiales,
      { id: crypto.randomUUID(), nombre: "", cantidad: 1, unidad: "unidad" },
    ])
  }

  const removeMaterial = (id: string) => {
    setMateriales(materiales.filter((m) => m.id !== id))
  }

  const updateMaterial = (id: string, field: keyof MaterialItem, value: string | number) => {
    setMateriales(materiales.map((m) => (m.id === id ? { ...m, [field]: value } : m)))
  }

  if (isFinalized) return null

  return (
    <>
      <div className="flex items-center gap-2">
        {validTransitions.includes("iniciado") && (
          <Button
            onClick={() => handleStatusChange("iniciado")}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Iniciar
          </Button>
        )}

        {validTransitions.includes("en_progreso") && (
          <Button
            onClick={() => handleStatusChange("en_progreso")}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            En Progreso
          </Button>
        )}

        {validTransitions.includes("finalizado") && (
          <Button onClick={() => handleStatusChange("finalizado")} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Finalizar
          </Button>
        )}

        {validTransitions.includes("cancelado") && (
          <Button
            onClick={() => handleStatusChange("cancelado")}
            disabled={isLoading}
            variant="destructive"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
            Cancelar
          </Button>
        )}
      </div>

      {/* ─── Wizard de Finalización (3 pasos) ───────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Finalizar Ticket</DialogTitle>
            <DialogDescription>
              Completa la información del trabajo antes de finalizar.
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className={cn("flex items-center", n < 3 && "flex-1")}>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 shrink-0",
                    step >= n
                      ? "bg-blue-500/30 border border-blue-400 text-blue-300"
                      : "bg-white/5 border border-white/20 text-white/30"
                  )}
                >
                  {n}
                </div>
                {n < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all duration-300",
                      step > n ? "bg-blue-400/60" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ─── Paso 1: Materiales ─── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/70">Materiales utilizados</p>
              {materiales.length === 0 && (
                <p className="text-xs text-white/40 italic">Sin materiales registrados</p>
              )}
              {materiales.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <Input
                    placeholder="Nombre del material"
                    value={m.nombre}
                    onChange={(e) => updateMaterial(m.id, "nombre", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Cant."
                    value={m.cantidad}
                    onChange={(e) => updateMaterial(m.id, "cantidad", Number(e.target.value))}
                    className="w-20"
                    min={1}
                  />
                  <Input
                    placeholder="Unidad"
                    value={m.unidad}
                    onChange={(e) => updateMaterial(m.id, "unidad", e.target.value)}
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-white/40 hover:text-red-400 shrink-0"
                    onClick={() => removeMaterial(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed border-white/20 text-white/50 hover:text-white"
                onClick={addMaterial}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar material
              </Button>
            </div>
          )}

          {/* ─── Paso 2: Tiempo ─── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-white/70">Tiempo trabajado</p>
              <div className="space-y-2">
                <Label>Duración en minutos</Label>
                <Input
                  type="number"
                  placeholder="Ej: 120"
                  value={tiempoTrabajado}
                  onChange={(e) => setTiempoTrabajado(e.target.value)}
                  min={0}
                />
                {tiempoTrabajado && Number(tiempoTrabajado) > 0 && (
                  <p className="text-xs text-blue-400/80">
                    = {formatMinutesToDuration(Number(tiempoTrabajado))}
                  </p>
                )}
              </div>
              <p className="text-xs text-white/35">
                Si no registras el tiempo, puedes dejarlo en blanco.
              </p>
            </div>
          )}

          {/* ─── Paso 3: Resumen ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/70">Resumen del trabajo</p>

              <div className="space-y-2">
                <Label>
                  Solución aplicada <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  placeholder="Describe detalladamente la solución que aplicaste..."
                  value={solucion}
                  onChange={(e) => setSolucion(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Observaciones{" "}
                  <span className="text-white/40 text-xs">(opcional)</span>
                </Label>
                <Textarea
                  placeholder="Notas adicionales, recomendaciones, etc..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
                disabled={isLoading}
              >
                ← Anterior
              </Button>
            )}
            {step < 3 ? (
              <Button onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}>
                Siguiente →
              </Button>
            ) : (
              <Button onClick={handleFinalize} isLoading={isLoading}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar Ticket
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
