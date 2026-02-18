import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTicketById, getTicketHistory } from "@/lib/actions/tickets"
import { getFasesByTicket } from "@/lib/actions/fases"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  ROLE_HIERARCHY,
} from "@/types"
import type { TicketFase } from "@/types"
import { TicketStatusActions } from "./ticket-status-actions"
import { TicketDetailTabs } from "./ticket-detail-tabs"

interface TicketPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TicketPageProps) {
  const { id } = await params
  const result = await getTicketById(id)

  if (!result.success || !result.data) {
    return { title: "Ticket no encontrado" }
  }

  return { title: `${result.data.numero_ticket} - ${result.data.asunto}` }
}

export default async function TicketDetailPage({ params }: TicketPageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) redirect("/login")

  const result = await getTicketById(id)
  if (!result.success || !result.data) notFound()

  const ticket = result.data

  // Permisos derivados del rol y la relación con el ticket
  const canEdit = ROLE_HIERARCHY[user.rol] >= 3
  const canChangeStatus =
    user.rol === "tecnico" ? ticket.tecnico_id === user.id : ROLE_HIERARCHY[user.rol] >= 3
  const canManageFases = ROLE_HIERARCHY[user.rol] >= 3
  const canUpdateProgress =
    user.rol === "tecnico" && ticket.tecnico_id === user.id
  const canViewComprobante =
    ticket.estado === "finalizado" && ROLE_HIERARCHY[user.rol] >= 2

  // Fetches paralelos: fases e historial (no bloquean entre sí)
  const [fasesResult, historialResult] = await Promise.all([
    ticket.tipo === "proyecto"
      ? getFasesByTicket(id)
      : Promise.resolve({ success: true, data: [] as TicketFase[] }),
    getTicketHistory(id),
  ])

  return (
    <div className="page-container">
      {/* ─── Navegación de regreso ─── */}
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/dashboard/tickets">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a tickets
        </Link>
      </Button>

      {/* ─── Header del ticket ─── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white font-heading">
              {ticket.numero_ticket}
            </h1>
            <Badge className={STATUS_COLORS[ticket.estado]}>
              {STATUS_LABELS[ticket.estado]}
            </Badge>
            <Badge className={PRIORITY_COLORS[ticket.prioridad]}>
              {PRIORITY_LABELS[ticket.prioridad]}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {ticket.tipo}
            </Badge>
          </div>
          <p className="text-white/60">{ticket.asunto}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canViewComprobante && (
            <Button variant="outline" size="sm" asChild className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              <Link href={`/dashboard/tickets/${ticket.id}/comprobante`}>
                <FileCheck className="h-4 w-4 mr-2" />
                Comprobante
              </Link>
            </Button>
          )}
          {canChangeStatus && <TicketStatusActions ticket={ticket} />}
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/tickets/${ticket.id}?edit=true`}>
                Editar
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ─── Contenido con tabs ─── */}
      <TicketDetailTabs
        ticket={ticket}
        fases={fasesResult.data ?? []}
        historial={historialResult.data ?? []}
        inspeccion={null}
        fotos={[]}
        canManageFases={canManageFases}
        canUpdateProgress={canUpdateProgress}
        canUploadFotos={ROLE_HIERARCHY[user.rol] >= 2}
      />
    </div>
  )
}
