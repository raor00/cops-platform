import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTicketById } from "@/lib/actions/tickets"
import { getInspeccionByTicket } from "@/lib/actions/inspecciones"
import { InspeccionForm } from "@/components/inspecciones/inspeccion-form"
import { InspeccionView } from "@/components/inspecciones/inspeccion-view"
import { ROLE_HIERARCHY } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InspeccionPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // Solo coordinadores+ pueden ver/crear inspecciones
  if (ROLE_HIERARCHY[user.rol] < 2) {
    redirect("/dashboard")
  }

  // Obtener el ticket
  const ticketResult = await getTicketById(id)
  if (!ticketResult.success || !ticketResult.data) {
    redirect("/dashboard/tickets")
  }

  const ticket = ticketResult.data

  // Obtener la inspección si existe
  const inspeccionResult = await getInspeccionByTicket(id)
  const inspeccion = inspeccionResult.success ? inspeccionResult.data : null

  const canEdit =
    !inspeccion || (inspeccion.estado !== "completada" && inspeccion.estado !== "reportada")

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/tickets/${ticket.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="page-title">Inspección Técnica</h1>
            <p className="page-description">
              {ticket.numero_ticket} — {ticket.asunto}
            </p>
          </div>
        </div>
        {inspeccion && (inspeccion.estado === "completada" || inspeccion.estado === "reportada") && (
          <Button variant="outline" asChild>
            <Link href={`/dashboard/tickets/${ticket.id}/inspeccion/view`}>
              <FileText className="h-4 w-4 mr-2" />
              Ver Reporte PDF
            </Link>
          </Button>
        )}
      </div>

      {/* Formulario o Vista */}
      {canEdit ? (
        <InspeccionForm ticketId={ticket.id} inspeccion={inspeccion} />
      ) : (
        inspeccion && <InspeccionView inspeccion={inspeccion} ticket={ticket} />
      )}
    </div>
  )
}
