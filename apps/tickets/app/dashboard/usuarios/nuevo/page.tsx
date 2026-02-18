import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/actions/auth"
import { isLocalMode } from "@/lib/local-mode"
import { ROLE_HIERARCHY } from "@/types"
import { NuevoUsuarioForm } from "./nuevo-usuario-form"

export const metadata = { title: "Nuevo Usuario" }

export default async function NuevoUsuarioPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 3) {
    redirect("/dashboard")
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/usuarios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="page-title">Nuevo Usuario</h1>
            <p className="page-description">Registra un nuevo miembro del equipo en el sistema</p>
          </div>
        </div>
      </div>

      <Card variant="glass" className="max-w-2xl">
        <CardHeader>
          <CardTitle>Datos del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <NuevoUsuarioForm isLocalMode={isLocalMode()} />
        </CardContent>
      </Card>
    </div>
  )
}
