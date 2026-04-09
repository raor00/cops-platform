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
import { getReportsSummary } from '@/lib/actions/reportes'
import { STATUS_LABELS, STATUS_COLORS, ROLE_HIERARCHY } from '@/types'
import type { EnhancedDashboardStats } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { TechnicianStatsTable } from '@/components/reportes/technician-stats-table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ReportsWorkspace } from '@/components/reportes/reports-workspace'

export const metadata = { title: 'Reportes' }

export default async function ReportesPage({ searchParams }: { searchParams: Promise<{ month?: string; client?: string; agency?: string; technician?: string; preset?: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  const filters = await searchParams

  // Solo coordinador+
  if (ROLE_HIERARCHY[user.rol] < 2) redirect('/dashboard')

  const result = await getEnhancedDashboardStats()
  const stats = result.data
  const reportsResult = await getReportsSummary(filters)
  const reports = reportsResult.data

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
          <Badge variant="outline" className="text-slate-500 border-slate-200 bg-white text-xs">
            Solo lectura
          </Badge>
        </div>
      </div>

      <Card variant="glass" className="mb-6">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Filtros analíticos</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Mes</label>
              <Input type="month" name="month" defaultValue={filters.month || ''} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Cliente / Empresa</label>
              <Input name="client" placeholder="Ej: Bancaribe" defaultValue={filters.client || ''} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Agencia</label>
              <Input name="agency" placeholder="Ej: Chacao" defaultValue={filters.agency || ''} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Técnico</label>
              <Input name="technician" placeholder="Ej: Rafael" defaultValue={filters.technician || ''} />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit">Aplicar filtros</Button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            <PresetLink href="/dashboard/reportes?preset=general" active={!filters.preset || filters.preset === 'general'}>General</PresetLink>
            <PresetLink href="/dashboard/reportes?preset=bancaribe&client=Bancaribe" active={filters.preset === 'bancaribe'}>Bancaribe</PresetLink>
            <PresetLink href="/dashboard/reportes?preset=cupones&client=Bancaribe" active={filters.preset === 'cupones'}>Cupones Bancaribe</PresetLink>
            <PresetLink href="/dashboard/reportes?preset=tecnicos" active={filters.preset === 'tecnicos'}>Por técnico</PresetLink>
          </div>
        </CardContent>
      </Card>

      {reports && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <KPICard icon={<TicketIcon className="h-5 w-5 text-blue-400" />} label="Tickets filtrados" value={reports.totalTickets} sub="según filtros actuales" color="blue" />
            <KPICard icon={<CheckCircle className="h-5 w-5 text-green-400" />} label="Finalizados" value={reports.totalFinalizados} sub="en el período seleccionado" color="green" />
            <KPICard icon={<BarChart2 className="h-5 w-5 text-yellow-400" />} label="Cupones usados" value={reports.totalCupones} sub="tickets con consumo registrado" color="yellow" />
            <KPICard icon={<Clock className="h-5 w-5 text-purple-400" />} label="Horas trabajadas" value={reports.totalHoras} sub={`${reports.totalAgencias} agencia(s) involucradas`} color="purple" />
          </div>

          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Resumen por cliente y agencia</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Cliente</th>
                    <th className="px-3 py-2">Agencia</th>
                    <th className="px-3 py-2">Tickets</th>
                    <th className="px-3 py-2">Servicios</th>
                    <th className="px-3 py-2">Proyectos</th>
                    <th className="px-3 py-2">Finalizados</th>
                    <th className="px-3 py-2">Cupones</th>
                    <th className="px-3 py-2">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.clientRows.map((row) => (
                    <tr key={`${row.cliente}-${row.agencia}`} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.cliente}</td>
                      <td className="px-3 py-2">{row.agencia}</td>
                      <td className="px-3 py-2">{row.tickets}</td>
                      <td className="px-3 py-2">{row.servicios}</td>
                      <td className="px-3 py-2">{row.proyectos}</td>
                      <td className="px-3 py-2">{row.finalizados}</td>
                      <td className="px-3 py-2">{row.cupones}</td>
                      <td className="px-3 py-2">{row.horasTrabajadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Detalle Bancaribe por agencia</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Agencia</th>
                    <th className="px-3 py-2">Tickets</th>
                    <th className="px-3 py-2">Servicios</th>
                    <th className="px-3 py-2">Finalizados</th>
                    <th className="px-3 py-2">Cupones</th>
                    <th className="px-3 py-2">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.bancaribeRows.length === 0 ? (
                    <tr><td className="px-3 py-4 text-slate-500" colSpan={6}>No hay tickets Bancaribe para los filtros seleccionados.</td></tr>
                  ) : reports.bancaribeRows.map((row) => (
                    <tr key={`b-${row.cliente}-${row.agencia}`} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.agencia}</td>
                      <td className="px-3 py-2">{row.tickets}</td>
                      <td className="px-3 py-2">{row.servicios}</td>
                      <td className="px-3 py-2">{row.finalizados}</td>
                      <td className="px-3 py-2">{row.cupones}</td>
                      <td className="px-3 py-2">{row.horasTrabajadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card variant="glass" className="mb-6">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Resumen por técnico</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-3 py-2">Técnico</th>
                    <th className="px-3 py-2">Tickets</th>
                    <th className="px-3 py-2">Servicios</th>
                    <th className="px-3 py-2">Proyectos</th>
                    <th className="px-3 py-2">Finalizados</th>
                    <th className="px-3 py-2">Cupones</th>
                    <th className="px-3 py-2">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.technicianRows.length === 0 ? (
                    <tr><td className="px-3 py-4 text-slate-500" colSpan={7}>No hay datos por técnico para los filtros seleccionados.</td></tr>
                  ) : reports.technicianRows.map((row) => (
                    <tr key={row.tecnico} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-2 font-medium text-slate-900">{row.tecnico}</td>
                      <td className="px-3 py-2">{row.tickets}</td>
                      <td className="px-3 py-2">{row.servicios}</td>
                      <td className="px-3 py-2">{row.proyectos}</td>
                      <td className="px-3 py-2">{row.finalizados}</td>
                      <td className="px-3 py-2">{row.cupones}</td>
                      <td className="px-3 py-2">{row.horasTrabajadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {reports && <ReportsWorkspace reports={reports} />}

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
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
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
                <span className="text-sm font-bold text-slate-900">{count}</span>
              </div>
            ))}
          </div>
          {/* Progress bar visual */}
          {stats.ticketsTotal > 0 && (
            <div className="mt-4 h-3 rounded-full overflow-hidden bg-slate-100 flex gap-0.5">
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
                    className={`h-full ${barColors[estado] ?? 'bg-slate-300'} first:rounded-l-full last:rounded-r-full transition-all`}
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
      <Card variant="glass" className="mb-6 animate-slide-up stagger-2">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-400" />
            Rendimiento por Técnico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TechnicianStatsTable kpis={stats.technicianKPIs} />
        </CardContent>
      </Card>

      {/* ─── Tickets por Mes (últimos 6) ─── */}
      {stats.ticketsPorMes.length > 0 && (
        <Card variant="glass" className="animate-slide-up stagger-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
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
                    <p className="text-xs text-slate-500 capitalize">{m.mes}</p>
                    <p className="text-sm font-bold text-slate-900">{total}</p>
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

function PresetLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Button asChild size="sm" variant={active ? 'default' : 'outline'}>
      <Link href={href}>{children}</Link>
    </Button>
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
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  )
}
