import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTechnicians } from "@/lib/actions/tickets"
import { ROLE_HIERARCHY } from "@/types"
import { CreateTicketForm } from "./create-ticket-form"

export const metadata = {
  title: "Nuevo Ticket",
}

export default async function NuevoTicketPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Verificar permisos - Solo Coordinador o superior
  if (ROLE_HIERARCHY[user.rol] < 2) {
    redirect("/dashboard")
  }

  // Obtener técnicos disponibles
  const techniciansResult = await getTechnicians()
  const technicians = techniciansResult.success ? techniciansResult.data || [] : []

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/tickets">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a tickets
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Crear Nuevo Ticket</h1>
        <p className="page-description">
          Registra un nuevo servicio o proyecto
        </p>
      </div>

      {/* Form Card */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Información del Ticket</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos para crear el ticket.
            Una vez creado, solo Gerente o superior podrá modificarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTicketForm technicians={technicians} />
        </CardContent>
      </Card>
    </div>
  )
}
