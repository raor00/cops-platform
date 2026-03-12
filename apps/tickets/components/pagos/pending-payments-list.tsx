"use client"

import { useState } from "react"
import { CreditCard } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PaymentDialog } from "./payment-dialog"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"

interface Payment {
  id: string
  monto_a_pagar: number
  estado_pago: string
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  ticket: { numero_ticket: string; asunto: string }
  tecnico: { nombre: string; apellido: string }
}

interface PendingPaymentsListProps {
  payments: Payment[]
}

export function PendingPaymentsList({ payments }: PendingPaymentsListProps) {
  const [activePayment, setActivePayment] = useState<Payment | null>(null)

  if (payments.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        No hay pagos pendientes
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-center gap-4 min-w-0">
              <Avatar>
                <AvatarFallback>
                  {getInitials(payment.tecnico.nombre, payment.tecnico.apellido)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-slate-900">
                  {payment.tecnico.nombre} {payment.tecnico.apellido}
                </p>
                <p className="truncate text-sm text-slate-600">
                  {payment.ticket.numero_ticket} — {payment.ticket.asunto}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(payment.fecha_habilitacion)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 ml-4">
              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(payment.monto_a_pagar)}
                </p>
                <Badge variant="warning">Pendiente</Badge>
              </div>
              <Button size="sm" onClick={() => setActivePayment(payment)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Crear solicitud
              </Button>
            </div>
          </div>
        ))}
      </div>

      {activePayment && (
        <PaymentDialog
          payment={activePayment}
          open={!!activePayment}
          onOpenChange={(open) => {
            if (!open) setActivePayment(null)
          }}
        />
      )}
    </>
  )
}
