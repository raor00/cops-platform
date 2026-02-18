import { redirect } from 'next/navigation'
import {
  TicketIcon,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  BarChart2,
  Download,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCurrentUser } from '@/lib/actions/auth'
import { getEnhancedDashboardStats } from '@/lib/actions/dashboard'
import { STATUS_LABELS, STATUS_COLORS, ROLE_HIERARCHY } from '@/types'
import type { EnhancedDashboardStats, TechnicianKPI } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { ReportExportButton } from './report-export-button'

export const metadata = { title: 'Reportes' }

export default async function ReportesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Solo coordinador+
  if (ROLE_HIERARCHY[user.rol] < 2) redirect('/dashboard')

  const result = await getEnhancedDashboardStats()
  const stats = result.data

  if (!stats) {
    return (
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Reportes</h1>
        </div>
        <div className="empty-state py-20">
          <BarChart2 className="empty-state-icon" />
          <p className="empty-state-title">Sin datos disponibles</p>
        </div>
      </div>
    )
  }

  const resolucionRate =
    stats.ticketsTotal > 0
      ? Math.round((stats.ticketsFinalizados / stats.ticketsTotal) * 100)
      : 0

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reportes</h1>
          <p className="page-description">Métricas y rendimiento del equipo</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-white/50 border-white/20 text-xs">
            Solo lectura
          </Badge>
          <ReportExportButton stats={stats} />
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <KPICard
          icon={<TicketIcon className="h-5 w-5 text-blue-400" />}
          label="Total Tickets"
          value={stats.ticketsTotal}
          sub={`${stats.ticketsHoy} hoy`}
          color="blue"
          className="stagger-1 animate-scale-in"
        />
        <KPICard
          icon={<CheckCircle className="h-5 w-5 text-green-400" />}
          label="Tasa de Resolución"
          value={`${resolucionRate}%`}
          sub={`${stats.ticketsFinalizados} completados`}
          color="green"
          className="stagger-2 animate-scale-in"
        />
        <KPICard
          icon={<Clock className="h-5 w-5 text-yellow-400" />}
          label="En Progreso"
          value={stats.ticketsPendientes}
          sub="tickets activos"
          color="yellow"
          className="stagger-3 animate-scale-in"
        />
        <KPICard
          icon={<DollarSign className="h-5 w-5 text-purple-400" />}
          label="Ingresos del Mes"
          value={formatCurrency(stats.ingresoEsteMes)}
          sub={`${formatCurrency(stats.ingresoPendiente)} pendiente`}
          color="purple"
          className="stagger-4 animate-scale-in"
        />
      </div>

      {/* ─── Distribución por Estado ─── */}
      <Card variant="glass" className="mb-6 animate-slide-up stagger-1">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.ticketsPorEstado).map(([estado, count]) => (
              <div key={estado} className="flex items-center gap-2">
                <Badge className={`text-xs ${STATUS_COLORS[estado as keyof typeof STATUS_COLORS] ?? ''}`}>
                  {STATUS_LABELS[estado as keyof typeof STATUS_LABELS] ?? estado}
                </Badge>
                <span className="text-sm font-bold text-white">{count}</span>
              </div>
            ))}
          </div>
          {/* Progress bar visual */}
          {stats.ticketsTotal > 0 && (
            <div className="mt-4 h-3 rounded-full overflow-hidden bg-white/5 flex gap-0.5">
              {Object.entries(stats.ticketsPorEstado).map(([estado, count]) => {
                const pct = Math.round((count / stats.ticketsTotal) * 100)
                if (pct === 0) return null
                const barColors: Record<string, string> = {
                  asignado: 'bg-blue-500',
                  iniciado: 'bg-yellow-500',
                  en_progreso: 'bg-purple-500',
                  finalizado: 'bg-green-500',
                  cancelado: 'bg-red-500',
                }
                return (
                  <div
                    key={estado}
                    className={`h-full ${barColors[estado] ?? 'bg-white/20'} first:rounded-l-full last:rounded-r-full transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${STATUS_LABELS[estado as keyof typeof STATUS_LABELS] ?? estado}: ${count}`}
                  />
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Rendimiento por Técnico ─── */}
      {stats.technicianKPIs.length > 0 && (
        <Card variant="glass" className="mb-6 animate-slide-up stagger-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Rendimiento por Técnico
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs text-white/40 font-medium px-5 py-3 uppercase tracking-wider">
                      Técnico
                    </th>
                    <th className="text-center text-xs text-white/40 font-medium px-3 py-3 uppercase tracking-wider">
                      Asignados
                    </th>
                    <th className="text-center text-xs text-white/40 font-medium px-3 py-3 uppercase tracking-wider">
                      Completados
                    </th>
                    <th className="text-center text-xs text-white/40 font-medium px-3 py-3 uppercase tracking-wider">
                      Activos
                    </th>
                    <th className="text-center text-xs text-white/40 font-medium px-3 py-3 uppercase tracking-wider">
                      Tasa
                    </th>
                    <th className="text-right text-xs text-white/40 font-medium px-5 py-3 uppercase tracking-wider">
                      Pendiente Pago
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats.technicianKPIs.map((kpi: TechnicianKPI) => {
                    const total = kpi.ticketsCompletados + kpi.ticketsActivos
                    const tasa = total > 0 ? Math.round((kpi.ticketsCompletados / total) * 100) : 0
                    return (
                      <tr key={kpi.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3">
                          <span className="font-medium text-white">
                            {kpi.nombre} {kpi.apellido}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-white/70">{total}</td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-green-400 font-semibold">
                            {kpi.ticketsCompletados}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-white/70">
                          {kpi.ticketsActivos}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="w-14 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500"
                                style={{ width: `${tasa}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60">{tasa}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {kpi.montoPendiente > 0 ? (
                            <span className="text-yellow-400 font-medium">
                              {formatCurrency(kpi.montoPendiente)}
                            </span>
                          ) : (
                            <span className="text-white/30 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── Tickets por Mes (últimos 6) ─── */}
      {stats.ticketsPorMes.length > 0 && (
        <Card variant="glass" className="animate-slide-up stagger-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-blue-400" />
              Evolución Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {stats.ticketsPorMes.map((m) => {
                const maxVal = Math.max(
                  ...stats.ticketsPorMes.map((x) => x.servicios + x.proyectos),
                  1
                )
                const total = m.servicios + m.proyectos
                const barH = Math.round((total / maxVal) * 100)
                return (
                  <div key={m.mes} className="text-center">
                    <div className="h-24 flex items-end justify-center mb-2">
                      <div
                        className="w-8 rounded-t-md bg-gradient-to-t from-blue-600/60 to-blue-400/60 border border-blue-500/30 transition-all"
                        style={{ height: `${Math.max(barH, 4)}%` }}
                        title={`${total} tickets`}
                      />
                    </div>
                    <p className="text-xs text-white/50 capitalize">{m.mes}</p>
                    <p className="text-sm font-bold text-white">{total}</p>
                    <p className="text-xs text-green-400">{m.finalizados} fin.</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({
  icon,
  label,
  value,
  sub,
  color,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  sub: string
  color: 'blue' | 'green' | 'yellow' | 'purple'
  className?: string
}) {
  const colors = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  }
  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 ${colors[color]} ${className ?? ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-xs text-white/40">{sub}</div>
    </div>
  )
}
