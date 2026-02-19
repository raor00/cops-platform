"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CreditCard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { processPaymentAction } from "@/lib/actions/pagos"
import { formatCurrency } from "@/lib/utils"

interface PaymentDialogProps {
  payment: {
    id: string
    monto_a_pagar: number
    tecnico: { nombre: string; apellido: string }
    ticket: { numero_ticket: string; asunto: string }
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

const METODO_OPTIONS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia Bancaria" },
  { value: "deposito", label: "Depósito" },
  { value: "cheque", label: "Cheque" },
] as const

export function PaymentDialog({ payment, open, onOpenChange }: PaymentDialogProps) {
  const router = useRouter()
  const [metodoPago, setMetodoPago] = useState("")
  const [referencia, setReferencia] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const showReferencia = metodoPago === "transferencia" || metodoPago === "deposito"

  const handleClose = (open: boolean) => {
    if (!open) {
      setMetodoPago("")
      setReferencia("")
      setObservaciones("")
    }
    onOpenChange(open)
  }

  const handlePay = async () => {
    if (!metodoPago) {
      toast.error("Selecciona un método de pago")
      return
    }
    setIsLoading(true)
    try {
      const result = await processPaymentAction(payment.id, {
        metodo_pago: metodoPago as "efectivo" | "transferencia" | "deposito" | "cheque",
        referencia_pago: referencia || undefined,
        observaciones: observaciones || undefined,
      })
      if (result.success) {
        toast.success("Solicitud de pago creada", { description: result.message })
        handleClose(false)
        router.refresh()
      } else {
        toast.error("Error al crear solicitud", { description: result.error })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Solicitud de Pago</DialogTitle>
          <DialogDescription>
            {payment.tecnico.nombre} {payment.tecnico.apellido} — {payment.ticket.numero_ticket}
          </DialogDescription>
        </DialogHeader>

        {/* Monto */}
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-sm text-white/60 mb-1">Monto a pagar</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(payment.monto_a_pagar)}</p>
          <p className="text-xs text-white/40 mt-1 truncate">{payment.ticket.asunto}</p>
        </div>

        <div className="space-y-4">
          {/* Método de pago */}
          <div className="space-y-2">
            <Label>Método de Pago <span className="text-red-400">*</span></Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método..." />
              </SelectTrigger>
              <SelectContent>
                {METODO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Referencia (solo para transferencia/depósito) */}
          {showReferencia && (
            <div className="space-y-2">
              <Label>Referencia / Número de transacción</Label>
              <Input
                placeholder="Ej: REF-2026-001"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
              />
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-2">
            <Label>Observaciones <span className="text-white/40 text-xs">(opcional)</span></Label>
            <Textarea
              placeholder="Notas adicionales..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handlePay} isLoading={isLoading} disabled={!metodoPago}>
            <CreditCard className="h-4 w-4 mr-2" />
            Crear Solicitud
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
