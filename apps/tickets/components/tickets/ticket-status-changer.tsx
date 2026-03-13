"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Clock, Loader2, PlayCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { changeTicketStatus } from "@/lib/actions/tickets"
import { STATUS_LABELS, VALID_TRANSITIONS } from "@/types"
import type { TicketStatus, TicketTechnicianInput } from "@/types"

interface TicketStatusChangerProps {
  ticketId: string
  currentStatus: TicketStatus
  isTechnician: boolean
}

export function TicketStatusChanger({
  ticketId,
  currentStatus,
  isTechnician: _,
}: TicketStatusChangerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showFinishDialog, setShowFinishDialog] = useState(false)
  const [technicianData, setTechnicianData] = useState<TicketTechnicianInput>({
    tiempo_trabajado: 0,
    solucion_aplicada: "",
    observaciones_tecnico: "",
  })

  const validTransitions = VALID_TRANSITIONS[currentStatus]

  async function handleStatusChange(newStatus: TicketStatus) {
    if (newStatus === "finalizado") {
      setShowFinishDialog(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticketId, newStatus)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.message)
      router.refresh()
    } catch {
      toast.error("Error al cambiar el estado")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFinish() {
    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticketId, "finalizado", technicianData)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success("Ticket finalizado exitosamente")
      setShowFinishDialog(false)
      router.refresh()
    } catch {
      toast.error("Error al finalizar el ticket")
    } finally {
      setIsLoading(false)
    }
  }

  function getButtonConfig(status: TicketStatus) {
    switch (status) {
      case "iniciado":
        return {
          icon: <PlayCircle className="h-4 w-4" />,
          label: "Iniciar trabajo",
          className: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        }
      case "en_progreso":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Marcar en progreso",
          className: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
        }
      case "finalizado":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: "Finalizar",
          className: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        }
      case "cancelado":
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: "Cancelar ticket",
          className: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        }
      default:
        return {
          icon: null,
          label: status,
          className: "",
        }
    }
  }

  return (
    <>
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Cambiar Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">
            Estado actual: <span className="font-medium text-slate-900">{STATUS_LABELS[currentStatus]}</span>
          </p>

          <div className="space-y-2">
            {validTransitions.map((status) => {
              const config = getButtonConfig(status)
              return (
                <Button
                  key={status}
                  variant="outline"
                  className={`w-full justify-start ${config.className}`}
                  onClick={() => handleStatusChange(status)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="mr-2">{config.icon}</span>
                  )}
                  {config.label}
                </Button>
              )
            })}
          </div>

          {validTransitions.length === 0 && (
            <p className="py-2 text-center text-sm text-slate-500">No hay acciones disponibles</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Ticket</DialogTitle>
            <DialogDescription>Complete la informacion del servicio realizado</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiempo trabajado (minutos)</Label>
              <Input
                type="number"
                min="0"
                value={technicianData.tiempo_trabajado || ""}
                onChange={(event) =>
                  setTechnicianData({
                    ...technicianData,
                    tiempo_trabajado: Number(event.target.value),
                  })
                }
                placeholder="Ej: 120"
              />
            </div>

            <div className="space-y-2">
              <Label>Solucion aplicada</Label>
              <Textarea
                value={technicianData.solucion_aplicada || ""}
                onChange={(event) =>
                  setTechnicianData({
                    ...technicianData,
                    solucion_aplicada: event.target.value,
                  })
                }
                placeholder="Describa la solucion implementada..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={technicianData.observaciones_tecnico || ""}
                onChange={(event) =>
                  setTechnicianData({
                    ...technicianData,
                    observaciones_tecnico: event.target.value,
                  })
                }
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinishDialog(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleFinish} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
