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

export default async function NuevoTicketPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
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

  const params = await searchParams
  const defaultTipo = params?.tipo === 'inspeccion' ? 'inspeccion'
    : params?.tipo === 'proyecto' ? 'proyecto'
    : 'servicio'

  const pageTitle = defaultTipo === 'inspeccion' ? 'Nueva Inspección'
    : defaultTipo === 'proyecto' ? 'Nuevo Proyecto'
    : 'Nuevo Servicio'

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
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-description">
          Registra un nuevo servicio, inspección o proyecto
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
          <CreateTicketForm technicians={technicians} defaultTipo={defaultTipo as 'servicio' | 'proyecto' | 'inspeccion'} />
        </CardContent>
      </Card>
    </div>
  )
}
