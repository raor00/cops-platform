"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Play, CheckCircle, XCircle, Loader2, Plus, Trash2, RotateCcw, GitMerge, MapPin, PauseCircle } from "lucide-react"

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
import { changeTicketStatus, convertirInspeccion, pauseTicketUntilTomorrow, registerTicketArrival, resumeTicketWork } from "@/lib/actions/tickets"
import { cn, formatDateTimeInputValue, formatMinutesToDuration, parseDateTimeLocalToISO } from "@/lib/utils"
import type { MaterialItem, Ticket, TicketStatus, UserRole } from "@/types"
import { VALID_TRANSITIONS, ADMIN_REVERSE_TRANSITIONS, ROLE_HIERARCHY, STATUS_LABELS } from "@/types"

interface TicketStatusActionsProps {
  ticket: Ticket
  userRole?: UserRole
}

export function TicketStatusActions({ ticket, userRole }: TicketStatusActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [usedMaterials, setUsedMaterials] = useState(
    (ticket.materiales_planificados?.length ?? 0) > 0
  )
  const [materiales, setMateriales] = useState<MaterialItem[]>(
    ticket.materiales_planificados ?? []
  )
  const [tiempoTrabajado, setTiempoTrabajado] = useState("")
  const [solucion, setSolucion] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [pauseDialogOpen, setPauseDialogOpen] = useState(false)
  const [pauseReason, setPauseReason] = useState("")
  const [nextServiceDate, setNextServiceDate] = useState(formatDateTimeInputValue(ticket.fecha_servicio))

  // Convert inspection state
  const [convertLoading, setConvertLoading] = useState(false)
  const [convertDialogOpen, setConvertDialogOpen] = useState(false)
  const [convertTipo, setConvertTipo] = useState<"servicio" | "proyecto">("servicio")

  const validTransitions = VALID_TRANSITIONS[ticket.estado]
  const canRevert = userRole ? ROLE_HIERARCHY[userRole] >= 3 : false
  const reverseTransitions = ADMIN_REVERSE_TRANSITIONS[ticket.estado]
  // Hide all buttons if finalized/cancelled AND admin has no reverse transitions
  const isFinalized =
    (ticket.estado === "finalizado" || ticket.estado === "cancelado") &&
    !(canRevert && reverseTransitions.length > 0)

  // Conversion: show when inspeccion is finalizada and not yet converted
  const canConvert =
    ticket.tipo === "inspeccion" &&
    ticket.estado === "finalizado" &&
    !ticket.ticket_derivado_id &&
    userRole &&
    ROLE_HIERARCHY[userRole] >= 2

  const resetWizard = () => {
    setStep(1)
    setUsedMaterials((ticket.materiales_planificados?.length ?? 0) > 0)
    setMateriales(ticket.materiales_planificados ?? [])
    setTiempoTrabajado("")
    setSolucion("")
    setObservaciones("")
  }

  const handleDialogChange = (open: boolean) => {
    if (!open) resetWizard()
    setDialogOpen(open)
  }

  const handlePauseDialogChange = (open: boolean) => {
    if (!open) {
      setPauseReason("")
      setNextServiceDate(formatDateTimeInputValue(ticket.fecha_servicio))
    }
    setPauseDialogOpen(open)
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

  const isPorHora = ticket.facturacion_tipo === "por_hora"
  const tarifaHora = ticket.tarifa_hora ?? 10
  const minutosNum = tiempoTrabajado ? parseInt(tiempoTrabajado) : 0
  const horasTrabajadas = minutosNum / 60
  const montoCalculado = isPorHora ? Math.round(horasTrabajadas * tarifaHora * 100) / 100 : null

  const handleFinalize = async () => {
    if (!solucion.trim()) {
      toast.error("La solución aplicada es requerida")
      return
    }
    if (isPorHora && !tiempoTrabajado) {
      toast.error("Registra el tiempo trabajado para calcular el monto")
      return
    }
    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticket.id, "finalizado", {
        materiales_usados: usedMaterials ? materiales.filter((m) => m.nombre.trim()) : [],
        tiempo_trabajado: minutosNum || undefined,
        solucion_aplicada: solucion,
        observaciones_tecnico: observaciones || undefined,
        ...(isPorHora && montoCalculado !== null ? { monto_servicio_final: montoCalculado } : {}),
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

  const handleArrival = async () => {
    setIsLoading(true)
    try {
      const result = await registerTicketArrival(ticket.id)
      if (result.success) {
        toast.success("Llegada registrada", { description: result.message })
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

  const handleResume = async () => {
    setIsLoading(true)
    try {
      const result = await resumeTicketWork(ticket.id)
      if (result.success) {
        toast.success("Trabajo actualizado", { description: result.message })
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

  const handlePause = async () => {
    if (!pauseReason.trim()) {
      toast.error("Debes indicar el motivo de la pausa")
      return
    }

    setIsLoading(true)
    try {
      const result = await pauseTicketUntilTomorrow(ticket.id, pauseReason, parseDateTimeLocalToISO(nextServiceDate))
      if (result.success) {
        toast.success("Ticket pausado", { description: result.message })
        setPauseDialogOpen(false)
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

  const handleConvert = async () => {
    setConvertLoading(true)
    try {
      const result = await convertirInspeccion(ticket.id, convertTipo)
      if (result.success) {
        toast.success(`Convertido a ${convertTipo}`, { description: result.message })
        setConvertDialogOpen(false)
        router.push(`/dashboard/tickets/${result.data?.ticketId}`)
      } else {
        toast.error("Error", { description: result.error })
      }
    } catch {
      toast.error("Error", { description: "Ocurrió un error inesperado" })
    } finally {
      setConvertLoading(false)
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

  if (isFinalized && !canConvert) return null

  return (
    <>
      {/* ─── Botones de conversión (inspeccion finalizada) ─── */}
      {canConvert && (
        <Button
          size="sm"
          onClick={() => setConvertDialogOpen(true)}
          className="bg-violet-600 hover:bg-violet-500 border-0 gap-1.5"
        >
          <GitMerge className="h-3.5 w-3.5" />
          Convertir Inspección
        </Button>
      )}
      {ticket.ticket_derivado_id && ticket.tipo === "inspeccion" && (
        <span className="text-xs text-green-400/70 flex items-center gap-1">
          <CheckCircle className="h-3.5 w-3.5" />
          Ya convertida
        </span>
      )}

      <div className="flex items-center gap-2">
        {!ticket.fecha_llegada && ticket.estado !== "finalizado" && ticket.estado !== "cancelado" && (
          <Button onClick={handleArrival} disabled={isLoading} variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
            Llegué al sitio
          </Button>
        )}

        {(validTransitions.includes("iniciado") || validTransitions.includes("en_progreso") || ticket.estado_operativo === "pausado" || ticket.estado_operativo === "reprogramado") && (
          <Button
            onClick={handleResume}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {ticket.estado_operativo === "pausado" || ticket.estado_operativo === "reprogramado" ? "Reanudar trabajo" : "Iniciar trabajo"}
          </Button>
        )}

        {ticket.estado !== "finalizado" && ticket.estado !== "cancelado" && ticket.estado_operativo === "trabajando" && (
          <Button onClick={() => setPauseDialogOpen(true)} disabled={isLoading} variant="outline">
            <PauseCircle className="h-4 w-4 mr-2" />
            Continuar mañana
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

        {/* ─── Botones de reversión (solo admin/gerente+) ─── */}
        {canRevert && reverseTransitions.length > 0 && (
          <div className="ml-1 flex items-center gap-1.5 border-l border-slate-200 pl-2">
            {reverseTransitions.map((s) => (
              <Button
                key={s}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(s)}
                disabled={isLoading}
                className="border-orange-400/25 text-orange-300/70 hover:border-orange-400/50 hover:text-orange-300 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                {STATUS_LABELS[s]}
              </Button>
            ))}
          </div>
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
                      ? "bg-sky-500/30 border border-sky-400 text-sky-300"
                      : "border border-slate-200 bg-slate-50 text-slate-400"
                  )}
                >
                  {n}
                </div>
                {n < 3 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-2 transition-all duration-300",
                      step > n ? "bg-sky-400/60" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ─── Paso 1: Materiales ─── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Materiales utilizados</p>

              {/* Toggle ¿Usó materiales? */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                <span className="text-sm text-slate-700">¿Se utilizaron materiales?</span>
                <button
                  onClick={() => setUsedMaterials(!usedMaterials)}
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200",
                    usedMaterials ? "bg-sky-500" : "bg-white/20"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200",
                      usedMaterials ? "translate-x-4.5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {usedMaterials && materiales.length === 0 && (
                <p className="text-xs italic text-slate-400">Sin materiales registrados</p>
              )}
              {usedMaterials && materiales.map((m) => (
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
                    className="h-9 w-9 shrink-0 text-slate-400 hover:text-red-500"
                    onClick={() => removeMaterial(m.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {usedMaterials && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-slate-200 text-slate-500 hover:text-slate-900"
                  onClick={addMaterial}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar material
                </Button>
              )}
              {!usedMaterials && (
                <p className="py-2 text-center text-xs italic text-slate-400">
                  Sin materiales — se finalizará sin lista de materiales
                </p>
              )}
            </div>
          )}

          {/* ─── Paso 2: Tiempo ─── */}
          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Tiempo trabajado</p>
              <div className="space-y-2">
                <Label>
                  Duración en minutos{isPorHora && <span className="text-red-400 ml-1">*</span>}
                </Label>
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
              {isPorHora && (
                <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3 space-y-1">
                  <p className="text-xs font-medium text-sky-300">Cálculo por hora</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">{horasTrabajadas.toFixed(2)} h</span>
                    <span className="text-slate-400">x</span>
                    <span className="text-slate-500">${tarifaHora}/h</span>
                    <span className="text-slate-400">=</span>
                    <span className="font-semibold text-sky-400">
                      ${montoCalculado !== null ? montoCalculado.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Este monto se guardará en el pago del técnico.</p>
                </div>
              )}
              {!isPorHora && (
                <p className="text-xs text-slate-400">
                  Si no registras el tiempo, puedes dejarlo en blanco.
                </p>
              )}
            </div>
          )}

          {/* ─── Paso 3: Resumen ─── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700">Resumen del trabajo</p>

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
                  <span className="text-xs text-slate-400">(opcional)</span>
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

      <Dialog open={pauseDialogOpen} onOpenChange={handlePauseDialogChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pausar y continuar otro día</DialogTitle>
            <DialogDescription>
              Registra el motivo y la nueva fecha de servicio para mantener el control operativo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="pause-reason">Motivo</Label>
              <Textarea
                id="pause-reason"
                value={pauseReason}
                onChange={(event) => setPauseReason(event.target.value)}
                placeholder="Ej: falta de material, cliente solicitó continuar mañana, acceso restringido..."
                className="mt-1 min-h-[110px]"
              />
            </div>

            <div>
              <Label htmlFor="next-service-date">Nueva fecha y hora de servicio</Label>
              <Input
                id="next-service-date"
                type="datetime-local"
                value={nextServiceDate}
                onChange={(event) => setNextServiceDate(event.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => handlePauseDialogChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePause} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <PauseCircle className="h-4 w-4 mr-2" />}
              Guardar pausa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Convertir Inspección ───────────────────────────────── */}
      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-violet-400" />
              Convertir Inspección
            </DialogTitle>
            <DialogDescription>
              Se creará un nuevo ticket ({ticket.numero_ticket}) con los datos del cliente de esta inspección.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-700">¿En qué tipo deseas convertir?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConvertTipo("servicio")}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  convertTipo === "servicio"
                    ? "border-sky-500/50 bg-sky-500/15 text-sky-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Servicio Correctivo
              </button>
              <button
                type="button"
                onClick={() => setConvertTipo("proyecto")}
                className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                  convertTipo === "proyecto"
                    ? "border-blue-500/50 bg-blue-500/15 text-blue-300"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Proyecto
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConvertDialogOpen(false)} disabled={convertLoading}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleConvert}
              disabled={convertLoading}
              className="bg-violet-600 hover:bg-violet-500 border-0"
            >
              {convertLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GitMerge className="h-4 w-4 mr-2" />}
              Convertir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
