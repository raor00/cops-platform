import { redirect } from "next/navigation"
import Link from "next/link"
import { Settings, Building2, Clock, Bell, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/actions/auth"
import { getConfiguracion } from "@/lib/actions/configuracion"
import { hasPermission, PERMISSION_LABELS, ROLE_LABELS, ROLE_PERMISSIONS, type UserRole } from "@/types"
import { ConfigSection } from "@/components/configuracion/config-section"
import type { LucideIcon } from "lucide-react"
import type { SystemConfig } from "@/types"

const ROLE_ORDER: UserRole[] = ["tecnico", "coordinador", "gerente", "vicepresidente", "presidente"]

export const metadata = {
  title: "Configuración",
}

const CONFIG_GROUPS: {
  key: string
  title: string
  icon: LucideIcon
  prefixes: string[]
}[] = [
    {
      key: "empresa",
      title: "Información de la Empresa",
      icon: Building2,
      prefixes: ["empresa_", "logo_"],
    },
    {
      key: "ticket",
      title: "Parámetros de Tickets y SLA",
      icon: Clock,
      prefixes: ["ticket_", "comision_", "inspeccion_"],
    },
    {
      key: "notif",
      title: "Notificaciones",
      icon: Bell,
      prefixes: ["notif_"],
    },
  ]

export default async function ConfiguracionPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!hasPermission(user, "config:view")) redirect("/dashboard")

  const result = await getConfiguracion()
  const configs: SystemConfig[] = result.data ?? []
  const canEdit = hasPermission(user, "config:edit")

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-400" />
            Configuración del Sistema
          </h1>
          <p className="page-description">
            Parámetros operativos de la plataforma
            {!canEdit && " — Solo lectura"}
          </p>
        </div>
        {!canEdit && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm border border-yellow-500/20 bg-yellow-500/10 rounded-xl px-3 py-1.5">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Se requiere Vicepresidente para editar</span>
          </div>
        )}
      </div>

      {/* Config sections */}
      <div className="space-y-6">
        <Card variant="glass">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Administración</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Accede a la gestión de usuarios y definición de accesos del módulo.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/usuarios">Ver usuarios</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/usuarios/nuevo">Nuevo usuario</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        {CONFIG_GROUPS.map((group) => {
          const groupItems = configs.filter((c) =>
            group.prefixes.some((p) => c.clave.startsWith(p))
          )
          if (groupItems.length === 0) return null
          return (
            <ConfigSection
              key={group.key}
              title={group.title}
              icon={<group.icon className="h-4 w-4 text-blue-400" />}
              items={groupItems}
              canEdit={canEdit}
            />
          )
        })}

        {configs.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Settings className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No hay configuraciones disponibles</p>
          </div>
        )}

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-base">Matriz de roles y permisos</CardTitle>
            <p className="text-sm text-slate-500">El sistema opera con permisos fijos por rol. Los técnicos solo gestionan sus tickets asignados y no pueden finalizar, borrar ni editar tickets administrativos.</p>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {ROLE_ORDER.map((role) => (
              <div key={role} className="rounded-xl border border-slate-200 bg-white/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="font-medium text-slate-900">{ROLE_LABELS[role]}</h3>
                  <Badge variant="secondary">{ROLE_PERMISSIONS[role].length} permisos</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_PERMISSIONS[role].map((permission) => (
                    <div key={permission} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs">
                      <p className="font-medium text-slate-800">{PERMISSION_LABELS[permission].label}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{PERMISSION_LABELS[permission].category}</p>
                    </div>
                  ))}
                  {role === "tecnico" && (
                    <Badge variant="outline" className="text-xs border-red-200 text-red-500">
                      sin finalizar tickets
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
