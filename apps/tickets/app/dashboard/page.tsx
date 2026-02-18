import { Suspense } from "react"
import Link from "next/link"
import {
  Ticket,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Plus,
  FolderKanban,
  Kanban,
  TrendingUp,
  Activity,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { TicketsByMonthChart } from "@/components/dashboard/tickets-by-month-chart"
import { StatusDistributionChart } from "@/components/dashboard/status-distribution-chart"
import { TechnicianPerformanceChart } from "@/components/dashboard/technician-performance-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PipelineBoard } from "@/components/dashboard/pipeline-board"
import { getEnhancedDashboardStats } from "@/lib/actions/dashboard"
import { getTickets } from "@/lib/actions/tickets"
import { getCurrentUser } from "@/lib/actions/auth"
import { formatCurrency } from "@/lib/utils"
import { ROLE_HIERARCHY } from "@/types"

// ─── Skeleton Components ────────────────────────────────────────────────────

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-3.5 w-24 bg-white/10 rounded-full" />
          <div className="h-8 w-20 bg-white/10 rounded-lg" />
          <div className="h-3 w-32 bg-white/10 rounded-full" />
        </div>
        <div className="h-12 w-12 bg-white/10 rounded-xl" />
      </div>
    </div>
  )
}

function ChartSkeleton({ height = "h-[220px]" }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center animate-pulse`}>
      <div className="text-white/20 text-sm">Cargando...</div>
    </div>
  )
}

// ─── Data Components (Server) ───────────────────────────────────────────────

async function DashboardContent() {
  const [statsResult, ticketsResult, user] = await Promise.all([
    getEnhancedDashboardStats(),
    getTickets({ pageSize: 50 }),
    getCurrentUser(),
  ])

  if (!statsResult.success || !statsResult.data || !user) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-red-400 text-sm">
        Error al cargar el dashboard. Por favor recarga la página.
      </div>
    )
  }

  const stats = statsResult.data
  const tickets = ticketsResult.data?.data || []
  const canViewPayments = ROLE_HIERARCHY[user.rol] >= 3
  const canViewTechKPIs = ROLE_HIERARCHY[user.rol] >= 2
  const isTecnico = user.rol === "tecnico"

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Buenos días"
    if (h < 18) return "Buenas tardes"
    return "Buenas noches"
  }

  const today = new Date().toLocaleDateString("es-VE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting()}, {user.nombre} 👋
          </h1>
          <p className="mt-1 text-sm text-white/50 capitalize">{today}</p>
        </div>
        {ROLE_HIERARCHY[user.rol] >= 2 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="ghost" size="sm" asChild className="border border-white/10 text-white/70 hover:text-white hover:bg-white/10">
              <Link href="/dashboard/tickets?tipo=proyecto">
                <FolderKanban className="h-4 w-4 mr-1.5" />
                Nuevo Proyecto
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 border-0 shadow-lg shadow-blue-500/25">
              <Link href="/dashboard/tickets/nuevo">
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo Servicio
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* ─── KPI Row ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Tickets"
          value={stats.ticketsTotal}
          displayValue={String(stats.ticketsTotal)}
          subtitle={`+${stats.ticketsHoy} hoy`}
          icon={<Ticket className="h-6 w-6 text-blue-400" />}
          colorClass="bg-blue-500/20"
          iconColorClass="text-blue-400"
          borderColorClass="border-blue-500/20"
          delay={0}
        />
        <KpiCard
          title="En Proceso"
          value={stats.ticketsPendientes}
          displayValue={String(stats.ticketsPendientes)}
          subtitle="Requieren atención"
          icon={<Clock className="h-6 w-6 text-yellow-400" />}
          colorClass="bg-yellow-500/20"
          iconColorClass="text-yellow-400"
          borderColorClass="border-yellow-500/20"
          delay={0.05}
        />
        <KpiCard
          title="Finalizados"
          value={stats.ticketsFinalizados}
          displayValue={String(stats.ticketsFinalizados)}
          subtitle="Completados"
          icon={<CheckCircle2 className="h-6 w-6 text-green-400" />}
          colorClass="bg-green-500/20"
          iconColorClass="text-green-400"
          borderColorClass="border-green-500/20"
          delay={0.1}
        />
        {canViewPayments ? (
          <KpiCard
            title="Ingresos del Mes"
            value={stats.ingresoEsteMes}
            displayValue={formatCurrency(stats.ingresoEsteMes)}
            subtitle={`${stats.pagosPendientes} pagos pendientes`}
            icon={<DollarSign className="h-6 w-6 text-purple-400" />}
            colorClass="bg-purple-500/20"
            iconColorClass="text-purple-400"
            borderColorClass="border-purple-500/20"
            delay={0.15}
          />
        ) : (
          <KpiCard
            title={isTecnico ? "Mis Activos" : "Urgentes"}
            value={isTecnico ? stats.ticketsPendientes : stats.ticketsPorPrioridad.urgente}
            displayValue={String(isTecnico ? stats.ticketsPendientes : stats.ticketsPorPrioridad.urgente)}
            subtitle={isTecnico ? "Asignados a mí" : "Requieren atención inmediata"}
            icon={<AlertCircle className="h-6 w-6 text-red-400" />}
            colorClass="bg-red-500/20"
            iconColorClass="text-red-400"
            borderColorClass="border-red-500/20"
            delay={0.15}
          />
        )}
      </div>

      {/* ─── Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-base">Tickets por Mes</CardTitle>
            </div>
            <p className="text-xs text-white/40">Últimos 6 meses</p>
          </CardHeader>
          <CardContent>
            {stats.ticketsPorMes.length > 0 ? (
              <TicketsByMonthChart data={stats.ticketsPorMes} />
            ) : (
              <ChartSkeleton />
            )}
          </CardContent>
        </Card>

        <Card variant="glass">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <CardTitle className="text-base">Distribución por Estado</CardTitle>
            </div>
            <p className="text-xs text-white/40">Todos los tickets</p>
          </CardHeader>
          <CardContent>
            <StatusDistributionChart data={stats.ticketsPorEstado} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Performance + Activity ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {canViewTechKPIs && stats.technicianKPIs.length > 0 ? (
          <Card variant="glass">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-400" />
                <CardTitle className="text-base">Rendimiento de Técnicos</CardTitle>
              </div>
              <p className="text-xs text-white/40">Completados vs activos</p>
            </CardHeader>
            <CardContent>
              <TechnicianPerformanceChart data={stats.technicianKPIs} />
            </CardContent>
          </Card>
        ) : (
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canViewPayments ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs text-white/50">Ingreso Total</p>
                      <p className="text-lg font-bold text-white">{formatCurrency(stats.ingresoTotal)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400/50" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div>
                      <p className="text-xs text-white/50">Comisiones Pendientes</p>
                      <p className="text-lg font-bold text-yellow-400">{formatCurrency(stats.ingresoPendiente)}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-400/50" />
                  </div>
                </>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-white/30 text-sm text-center px-4">
                  Métricas de rendimiento disponibles para coordinadores y superiores
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card variant="glass">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-yellow-400" />
              <CardTitle className="text-base">Actividad Reciente</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={stats.actividadReciente} />
          </CardContent>
        </Card>
      </div>

      {/* ─── Pipeline Board ─────────────────────────────────────────────────── */}
      {tickets.length > 0 && (
        <Card variant="glass">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Pipeline de Tickets</CardTitle>
              <p className="text-xs text-white/40 mt-0.5">Vista de flujo por estado</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-white/50 hover:text-white text-xs border border-white/10">
                <Link href="/dashboard/pipeline">
                  <Kanban className="h-3.5 w-3.5 mr-1.5" />
                  Pipeline completo
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="text-white/50 hover:text-white text-xs border border-white/10">
                <Link href="/dashboard/tickets">Ver lista</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PipelineBoard tickets={tickets} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default async function DashboardPage() {
  return (
    <div className="page-container">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-16 w-64 bg-white/5 rounded-2xl animate-pulse" />
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => <KpiSkeleton key={i} />)}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-[320px] animate-pulse" />
            </div>
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  )
}
