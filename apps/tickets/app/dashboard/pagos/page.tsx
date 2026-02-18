import { redirect } from "next/navigation"
import { DollarSign, CheckCircle, Clock } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoPaymentsView } from "@/lib/mock-data"
import { ROLE_HIERARCHY } from "@/types"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { PendingPaymentsList } from "@/components/pagos/pending-payments-list"

export const metadata = { title: "Pagos" }

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

async function getPayments(): Promise<{ pending: Payment[]; completed: Payment[] }> {
  if (isLocalMode()) {
    const demoPayments = getDemoPaymentsView()
    return {
      pending: demoPayments.pending as Payment[],
      completed: demoPayments.completed as Payment[],
    }
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos_tecnicos")
    .select(`
      *,
      ticket:tickets(numero_ticket, asunto),
      tecnico:users!pagos_tecnicos_tecnico_id_fkey(nombre, apellido)
    `)
    .order("fecha_habilitacion", { ascending: false })

  const payments = (data as Payment[]) || []
  return {
    pending: payments.filter((p) => p.estado_pago === "pendiente"),
    completed: payments.filter((p) => p.estado_pago === "pagado"),
  }
}

export default async function PagosPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 3) {
    redirect("/dashboard")
  }

  const { pending, completed } = await getPayments()
  const totalPending = pending.reduce((sum, p) => sum + p.monto_a_pagar, 0)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos a Técnicos</h1>
          <p className="page-description">Gestiona los pagos por servicios realizados</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="stat-card stat-card-yellow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Pendientes</p>
              <p className="text-3xl font-bold text-white mt-1">{pending.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20 border border-yellow-500/30">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Monto Pendiente</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalPending)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-500/30">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/60">Completados</p>
              <p className="text-3xl font-bold text-white mt-1">{completed.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20 border border-green-500/30">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <Card variant="glass" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PendingPaymentsList payments={pending} />
        </CardContent>
      </Card>

      {/* Completed Payments */}
      {completed.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Pagos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completed.slice(0, 10).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(payment.tecnico.nombre, payment.tecnico.apellido)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {payment.tecnico.nombre} {payment.tecnico.apellido}
                      </p>
                      <p className="text-sm text-white/60">{payment.ticket.numero_ticket}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{formatCurrency(payment.monto_a_pagar)}</p>
                    <p className="text-xs text-white/50">
                      {payment.fecha_pago && formatDate(payment.fecha_pago)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
