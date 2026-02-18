import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getCurrentUser } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoUsers } from "@/lib/mock-data"
import { ROLE_HIERARCHY, ROLE_LABELS } from "@/types"
import { getInitials } from "@/lib/utils"
import type { User } from "@/types"

export const metadata = { title: "Usuarios" }

async function getUsers(): Promise<User[]> {
  if (isLocalMode()) {
    return getDemoUsers()
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("users")
    .select("*")
    .order("nivel_jerarquico", { ascending: false })
    .order("nombre")
  return (data as User[]) || []
}

export default async function UsuariosPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 3) {
    redirect("/dashboard")
  }

  const users = await getUsers()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-description">Gestiona el equipo del sistema</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/usuarios/nuevo">
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {users.map((u) => (
          <Card key={u.id} variant="glass" className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(u.nombre, u.apellido)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-white truncate">
                    {u.nombre} {u.apellido}
                  </h3>
                  <Badge variant={u.estado === "activo" ? "success" : "secondary"}>
                    {u.estado}
                  </Badge>
                </div>
                <p className="text-sm text-white/60 truncate">{u.email}</p>
                <p className="text-xs text-blue-400 mt-1">{ROLE_LABELS[u.rol]}</p>
              </div>
            </div>
            {u.telefono && (
              <p className="text-xs text-white/50 mt-3 pl-16">{u.telefono}</p>
            )}
          </Card>
        ))}

        {users.length === 0 && (
          <div className="col-span-full empty-state py-12">
            <UserPlus className="empty-state-icon" />
            <p className="empty-state-title">No hay usuarios</p>
            <p className="empty-state-description">Crea el primer usuario del sistema</p>
          </div>
        )}
      </div>
    </div>
  )
}
