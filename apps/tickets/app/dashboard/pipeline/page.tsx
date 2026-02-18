import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Kanban } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTickets } from "@/lib/actions/tickets"
import { getAllUsers } from "@/lib/actions/usuarios"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoUsers } from "@/lib/mock-data"
import { ROLE_HIERARCHY } from "@/types"
import { PipelineFilters } from "@/components/pipeline/pipeline-filters"
import { PipelinePageBoard } from "@/components/pipeline/pipeline-page-board"
import type { TicketPriority } from "@/types"

export const metadata = {
  title: "Pipeline",
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ tecnico?: string; prioridad?: string }>
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams])
  if (!user) redirect("/login")

  const isTecnico = ROLE_HIERARCHY[user.rol] === 1
  const tecnicoId = isTecnico ? user.id : (params.tecnico || undefined)

  const ticketsResult = await getTickets({
    pageSize: 200,
    tecnicoId,
    priority: params.prioridad as TicketPriority | undefined,
  })

  const tickets = ticketsResult.data?.data ?? []

  // Only coordinator+ can filter by technician
  let technicians: Array<{ id: string; nombre: string; apellido: string }> = []
  if (ROLE_HIERARCHY[user.rol] >= 2) {
    const allUsers = isLocalMode()
      ? getDemoUsers()
      : (await getAllUsers()).data ?? []
    technicians = allUsers
      .filter((u) => u.rol === "tecnico")
      .map((u) => ({ id: u.id, nombre: u.nombre, apellido: u.apellido }))
  }

  const activeTickets = tickets.filter((t) => t.estado !== "cancelado")

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Kanban className="h-6 w-6 text-blue-400" />
            Pipeline de Tickets
          </h1>
          <p className="page-description">
            {activeTickets.length} ticket{activeTickets.length !== 1 ? "s" : ""} activo{activeTickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        {ROLE_HIERARCHY[user.rol] >= 2 && (
          <Suspense>
            <PipelineFilters
              technicians={technicians}
              currentTechId={params.tecnico}
              currentPriority={params.prioridad}
            />
          </Suspense>
        )}
      </div>

      {/* Board */}
      <PipelinePageBoard tickets={tickets} />
    </div>
  )
}
