import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Ticket,
  BarChart2,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Mail,
  CreditCard,
  Activity,
} from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCurrentUser } from '@/lib/actions/auth'
import { getUserById } from '@/lib/actions/usuarios'
import { getTickets } from '@/lib/actions/tickets'
import { getTechnicianStats } from '@/lib/actions/dashboard'
import { isLocalMode } from '@/lib/local-mode'
import { getDemoUsers } from '@/lib/mock-data'
import {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
} from '@/types'
import type { UserProfile, Ticket as TicketType, TechnicianStats } from '@/types'
import { getInitials } from '@/lib/utils'
import { ProfileEditDialog } from '@/components/usuarios/profile-edit-dialog'

interface UsuarioPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UsuarioPageProps) {
  const { id } = await params
  const result = await getUserById(id)
  if (!result.success || !result.data) return { title: 'Usuario no encontrado' }
  return { title: `${result.data.nombre} ${result.data.apellido}` }
}

export default async function UsuarioDetailPage({ params }: UsuarioPageProps) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Solo gerente+ o el propio usuario
  const canViewOthers = ROLE_HIERARCHY[user.rol] >= 3
  if (!canViewOthers && user.id !== id) redirect('/dashboard')

  // Obtener datos del usuario objetivo
  let targetUser: UserProfile | null = null

  if (isLocalMode()) {
    const demoUsers = getDemoUsers()
    const found = demoUsers.find((u) => u.id === id)
    if (found) targetUser = { ...found, foto_perfil_url: null, foto_perfil_path: null, especialidad: null, activo_desde: null } as unknown as UserProfile
  } else {
    const result = await getUserById(id)
    if (result.success && result.data) targetUser = result.data
  }

  if (!targetUser) notFound()

  const canEdit = ROLE_HIERARCHY[user.rol] >= 3 || user.id === id
  const isTecnico = targetUser.rol === 'tecnico'

  // Fetches paralelos
  const [ticketsResult, statsResult] = await Promise.all([
    isTecnico
      ? getTickets({ tecnicoId: id, pageSize: 20 })
      : Promise.resolve({ success: true as const, data: { data: [] as TicketType[], total: 0, page: 1, pageSize: 20, totalPages: 0 } }),
    isTecnico
      ? getTechnicianStats(id)
      : Promise.resolve({ success: true as const, data: null }),
  ])

  const tickets: TicketType[] = ticketsResult.data?.data ?? []
  const stats = statsResult.data as TechnicianStats | null

  return (
    <div className="page-container animate-fade-in">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/usuarios">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a usuarios
        </Link>
      </Button>

      {/* ─── Profile Header ─── */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 mb-6 stagger-1 animate-slide-up">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-white/20 shrink-0">
            {targetUser.foto_perfil_url && (
              <AvatarImage
                src={targetUser.foto_perfil_url}
                alt={`${targetUser.nombre} ${targetUser.apellido}`}
              />
            )}
            <AvatarFallback className="bg-gradient-to-br from-blue-600/40 to-purple-600/40 text-white text-2xl font-bold">
              {getInitials(targetUser.nombre, targetUser.apellido)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white font-heading">
                {targetUser.nombre} {targetUser.apellido}
              </h1>
              <Badge variant={targetUser.estado === 'activo' ? 'success' : 'secondary'}>
                {targetUser.estado}
              </Badge>
            </div>
            <p className="text-blue-400 font-medium text-sm mb-2">{ROLE_LABELS[targetUser.rol]}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {targetUser.email}
              </span>
              {targetUser.telefono && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {targetUser.telefono}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                {targetUser.cedula}
              </span>
            </div>
          </div>

          {canEdit && <ProfileEditDialog user={targetUser} />}
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="perfil">
        <TabsList className="mb-6">
          <TabsTrigger value="perfil">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          {isTecnico && (
            <TabsTrigger value="tickets">
              <Ticket className="h-4 w-4 mr-2" />
              Tickets
              {tickets.length > 0 && (
                <span className="ml-1.5 text-xs bg-blue-500/20 text-blue-300 rounded-full px-1.5 py-0.5">
                  {tickets.length}
                </span>
              )}
            </TabsTrigger>
          )}
          {isTecnico && (
            <TabsTrigger value="rendimiento">
              <BarChart2 className="h-4 w-4 mr-2" />
              Rendimiento
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── Tab: Perfil ── */}
        <TabsContent value="perfil">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card variant="glass" className="stagger-2 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Nombre" value={`${targetUser.nombre} ${targetUser.apellido}`} />
                <InfoRow label="Email" value={targetUser.email} />
                <InfoRow label="Cédula" value={targetUser.cedula} />
                {targetUser.telefono && (
                  <InfoRow label="Teléfono" value={targetUser.telefono} />
                )}
              </CardContent>
            </Card>

            <Card variant="glass" className="stagger-3 animate-slide-up">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  Acceso y Rol
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Rol" value={ROLE_LABELS[targetUser.rol]} />
                <InfoRow label="Nivel" value={`${ROLE_HIERARCHY[targetUser.rol]} de 5`} />
                <InfoRow
                  label="Estado"
                  value={targetUser.estado === 'activo' ? 'Activo' : 'Inactivo'}
                />
                <InfoRow
                  label="Miembro desde"
                  value={new Date(targetUser.created_at).toLocaleDateString('es-VE')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab: Tickets ── */}
        {isTecnico && (
          <TabsContent value="tickets">
            <Card variant="glass" className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-white">
                  Tickets Asignados
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tickets.length === 0 ? (
                  <div className="p-8 text-center text-white/40">
                    <Ticket className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>Sin tickets asignados</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {tickets.map((t) => (
                      <Link
                        key={t.id}
                        href={`/dashboard/tickets/${t.id}`}
                        className="flex items-start gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <span className="text-xs text-blue-400 font-mono">
                              {t.numero_ticket}
                            </span>
                            <Badge className={`text-xs ${STATUS_COLORS[t.estado]}`}>
                              {STATUS_LABELS[t.estado]}
                            </Badge>
                            <Badge className={`text-xs ${PRIORITY_COLORS[t.prioridad]}`}>
                              {PRIORITY_LABELS[t.prioridad]}
                            </Badge>
                          </div>
                          <p className="text-sm text-white/80 truncate">{t.asunto}</p>
                          <p className="text-xs text-white/40 mt-0.5">{t.cliente_nombre}</p>
                        </div>
                        <span className="text-xs text-white/30 shrink-0 mt-1">
                          {new Date(t.created_at).toLocaleDateString('es-VE')}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ── Tab: Rendimiento ── */}
        {isTecnico && (
          <TabsContent value="rendimiento">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Ticket className="h-5 w-5 text-blue-400" />}
                label="Total Asignados"
                value={stats?.ticketsAsignados ?? 0}
                color="blue"
                className="stagger-1 animate-scale-in"
              />
              <StatCard
                icon={<CheckCircle className="h-5 w-5 text-green-400" />}
                label="Completados"
                value={stats?.ticketsCompletados ?? 0}
                color="green"
                className="stagger-2 animate-scale-in"
              />
              <StatCard
                icon={<Activity className="h-5 w-5 text-purple-400" />}
                label="En Progreso"
                value={stats?.ticketsEnProgreso ?? 0}
                color="purple"
                className="stagger-3 animate-scale-in"
              />
              <StatCard
                icon={<DollarSign className="h-5 w-5 text-yellow-400" />}
                label="Pagos Pendientes"
                value={stats?.pagosPendientes ?? 0}
                color="yellow"
                className="stagger-4 animate-scale-in"
              />
            </div>

            {stats && stats.ticketsAsignados > 0 && (
              <Card variant="glass" className="mt-4 animate-slide-up stagger-2">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-white">
                    Tasa de Resolución
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60">
                      {stats.ticketsCompletados} de {stats.ticketsAsignados} tickets completados
                    </span>
                    <span className="text-lg font-bold text-white">
                      {Math.round(
                        (stats.ticketsCompletados / stats.ticketsAsignados) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 progress-fill"
                      style={{
                        width: `${Math.round(
                          (stats.ticketsCompletados / stats.ticketsAsignados) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  {stats.tiempoPromedioMinutos > 0 && (
                    <p className="text-xs text-white/40 mt-3 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Tiempo promedio: {Math.floor(stats.tiempoPromedioMinutos / 60)}h{' '}
                      {stats.tiempoPromedioMinutos % 60}min por ticket
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-xs text-white/40 shrink-0">{label}</span>
      <span className="text-sm text-white text-right">{value}</span>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  color,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'purple' | 'yellow'
  className?: string
}) {
  const colorMap = {
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
  }
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-5 ${colorMap[color]} ${className ?? ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-white/50 font-medium uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  )
}
