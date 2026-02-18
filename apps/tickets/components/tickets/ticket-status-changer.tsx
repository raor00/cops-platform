"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, PlayCircle, CheckCircle2, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { changeTicketStatus } from "@/lib/actions/tickets"
import { VALID_TRANSITIONS, STATUS_LABELS } from "@/types"
import type { TicketStatus, TicketTechnicianInput } from "@/types"

interface TicketStatusChangerProps {
  ticketId: string
  currentStatus: TicketStatus
  isTechnician: boolean
}

export function TicketStatusChanger({ 
  ticketId, 
  currentStatus, 
  isTechnician 
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

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (newStatus === "finalizado") {
      setShowFinishDialog(true)
      return
    }

    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticketId, newStatus)
      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al cambiar el estado")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const result = await changeTicketStatus(ticketId, "finalizado", technicianData)
      if (result.success) {
        toast.success("Ticket finalizado exitosamente")
        setShowFinishDialog(false)
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error al finalizar el ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonConfig = (status: TicketStatus) => {
    switch (status) {
      case "iniciado":
        return {
          icon: <PlayCircle className="h-4 w-4" />,
          label: "Iniciar trabajo",
          className: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30",
        }
      case "en_progreso":
        return {
          icon: <Clock className="h-4 w-4" />,
          label: "Marcar en progreso",
          className: "bg-purple-500/20 border-purple-500/30 text-purple-400 hover:bg-purple-500/30",
        }
      case "finalizado":
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          label: "Finalizar",
          className: "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30",
        }
      case "cancelado":
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: "Cancelar ticket",
          className: "bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30",
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
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-white/60">
            Estado actual: <span className="text-white font-medium">{STATUS_LABELS[currentStatus]}</span>
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
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <span className="mr-2">{config.icon}</span>
                  )}
                  {config.label}
                </Button>
              )
            })}
          </div>

          {validTransitions.length === 0 && (
            <p className="text-sm text-white/50 text-center py-2">
              No hay acciones disponibles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Finish Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Ticket</DialogTitle>
            <DialogDescription>
              Complete la información del servicio realizado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tiempo trabajado (minutos)</Label>
              <Input
                type="number"
                min="0"
                value={technicianData.tiempo_trabajado || ""}
                onChange={(e) =>
                  setTechnicianData({
                    ...technicianData,
                    tiempo_trabajado: Number(e.target.value),
                  })
                }
                placeholder="Ej: 120"
              />
            </div>

            <div className="space-y-2">
              <Label>Solución aplicada</Label>
              <Textarea
                value={technicianData.solucion_aplicada || ""}
                onChange={(e) =>
                  setTechnicianData({
                    ...technicianData,
                    solucion_aplicada: e.target.value,
                  })
                }
                placeholder="Describa la solución implementada..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea
                value={technicianData.observaciones_tecnico || ""}
                onChange={(e) =>
                  setTechnicianData({
                    ...technicianData,
                    observaciones_tecnico: e.target.value,
                  })
                }
                placeholder="Observaciones adicionales..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFinishDialog(false)}
              disabled={isLoading}
            >
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
