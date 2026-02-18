"use client"

import { useState, useMemo } from "react"
import { DollarSign, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency, formatDate, getInitials } from "@/lib/utils"
import { PendingPaymentsList } from "@/components/pagos/pending-payments-list"
import {
  PagosFiltersBar,
  ActiveFiltersDisplay,
  type PagosFilters,
} from "@/components/pagos/pagos-filters"
import type { PaymentExportData } from "@/lib/utils/csv-export"

interface Payment {
  id: string
  monto_a_pagar: number
  estado_pago: string
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  referencia_pago: string | null
  ticket: { numero_ticket: string; asunto: string }
  tecnico: { id: string; nombre: string; apellido: string }
}

interface PagosClientProps {
  allPayments: Payment[]
  technicians: Array<{ id: string; nombre: string; apellido: string }>
}

export function PagosClient({ allPayments, technicians }: PagosClientProps) {
  const [filters, setFilters] = useState<PagosFilters>({
    estado: "all",
  })

  // Filtrar pagos según los filtros activos
  const filteredPayments = useMemo(() => {
    return allPayments.filter((payment) => {
      // Filtro de estado
      if (filters.estado && filters.estado !== "all") {
        if (payment.estado_pago !== filters.estado) return false
      }

      // Filtro de técnico
      if (filters.tecnico) {
        if (payment.tecnico.id !== filters.tecnico) return false
      }

      // Filtro de método de pago
      if (filters.metodo_pago) {
        if (payment.metodo_pago !== filters.metodo_pago) return false
      }

      // Filtro de fecha desde
      if (filters.fecha_desde) {
        const paymentDate = new Date(payment.fecha_habilitacion)
        const filterDate = new Date(filters.fecha_desde)
        if (paymentDate < filterDate) return false
      }

      // Filtro de fecha hasta
      if (filters.fecha_hasta) {
        const paymentDate = new Date(payment.fecha_habilitacion)
        const filterDate = new Date(filters.fecha_hasta)
        filterDate.setHours(23, 59, 59, 999)
        if (paymentDate > filterDate) return false
      }

      // Filtro de monto mínimo
      if (filters.monto_min !== undefined) {
        if (payment.monto_a_pagar < filters.monto_min) return false
      }

      // Filtro de monto máximo
      if (filters.monto_max !== undefined) {
        if (payment.monto_a_pagar > filters.monto_max) return false
      }

      return true
    })
  }, [allPayments, filters])

  const pending = filteredPayments.filter((p) => p.estado_pago === "pendiente")
  const completed = filteredPayments.filter((p) => p.estado_pago === "pagado")
  const totalPending = pending.reduce((sum, p) => sum + p.monto_a_pagar, 0)

  // Preparar datos para export
  const paymentsForExport: PaymentExportData[] = filteredPayments.map((payment) => ({
    numero_ticket: payment.ticket.numero_ticket,
    asunto: payment.ticket.asunto,
    tecnico: `${payment.tecnico.nombre} ${payment.tecnico.apellido}`,
    monto: payment.monto_a_pagar,
    estado: payment.estado_pago,
    fecha_habilitacion: payment.fecha_habilitacion,
    fecha_pago: payment.fecha_pago,
    metodo_pago: payment.metodo_pago,
    referencia_pago: payment.referencia_pago,
  }))

  function handleRemoveFilter(key: keyof PagosFilters) {
    setFilters((prev) => ({ ...prev, [key]: undefined }))
  }

  return (
    <>
      {/* Filtros */}
      <div className="mb-6 space-y-3">
        <PagosFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          technicians={technicians}
          paymentsForExport={paymentsForExport}
        />
        <ActiveFiltersDisplay filters={filters} onRemoveFilter={handleRemoveFilter} />
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
            Pagos Pendientes ({pending.length})
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
              Pagos Realizados ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completed.slice(0, 20).map((payment) => (
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
                      {payment.metodo_pago && (
                        <p className="text-xs text-white/40 capitalize mt-1">
                          {payment.metodo_pago}
                          {payment.referencia_pago && ` - Ref: ${payment.referencia_pago}`}
                        </p>
                      )}
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

      {/* Sin resultados */}
      {filteredPayments.length === 0 && (
        <Card variant="glass">
          <CardContent className="py-12 text-center">
            <p className="text-white/50">No se encontraron pagos con los filtros seleccionados</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}
