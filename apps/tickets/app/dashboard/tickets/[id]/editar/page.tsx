import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTechnicians, getTicketById } from "@/lib/actions/tickets"
import { ROLE_HIERARCHY } from "@/types"
import { EditTicketForm } from "../edit-ticket-form"

interface EditarTicketPageProps {
  params: Promise<{ id: string }>
}

export const metadata = {
  title: "Editar Ticket",
}

export default async function EditarTicketPage({ params }: EditarTicketPageProps) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()])

  if (!user) redirect("/login")
  if (ROLE_HIERARCHY[user.rol] < 3) redirect(`/dashboard/tickets/${id}`)

  const [ticketResult, techniciansResult] = await Promise.all([
    getTicketById(id),
    getTechnicians(),
  ])

  if (!ticketResult.success || !ticketResult.data) notFound()

  const technicians = techniciansResult.success ? techniciansResult.data ?? [] : []
  const ticket = ticketResult.data

  return (
    <div className="page-container mx-auto max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/dashboard/tickets/${ticket.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al ticket
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="page-title">Editar Ticket</h1>
        <p className="page-description">
          Actualiza la información operativa de {ticket.numero_ticket}.
        </p>
      </div>

      <Card variant="glass">
        <CardHeader>
          <CardTitle>Información editable</CardTitle>
          <CardDescription>
            Esta pantalla permite modificar los datos del ticket una vez creado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditTicketForm ticket={ticket} technicians={technicians} />
        </CardContent>
      </Card>
    </div>
  )
}
