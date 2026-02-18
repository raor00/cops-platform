import { redirect } from "next/navigation"
import { Settings, Building2, Clock, Bell, Lock } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"
import { getConfiguracion } from "@/lib/actions/configuracion"
import { hasPermission } from "@/types"
import { ConfigSection } from "@/components/configuracion/config-section"
import type { LucideIcon } from "lucide-react"
import type { SystemConfig } from "@/types"

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
  if (!hasPermission(user.rol, "config:view")) redirect("/dashboard")

  const result = await getConfiguracion()
  const configs: SystemConfig[] = result.data ?? []
  const canEdit = hasPermission(user.rol, "config:edit")

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
        {CONFIG_GROUPS.map((group) => {
          const groupItems = configs.filter((c) =>
            group.prefixes.some((p) => c.clave.startsWith(p))
          )
          if (groupItems.length === 0) return null
          return (
            <ConfigSection
              key={group.key}
              title={group.title}
              icon={group.icon}
              items={groupItems}
              canEdit={canEdit}
            />
          )
        })}

        {configs.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <Settings className="h-10 w-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No hay configuraciones disponibles</p>
          </div>
        )}
      </div>
    </div>
  )
}
