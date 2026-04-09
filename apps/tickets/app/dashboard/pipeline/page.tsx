import { Suspense } from "react"
import { redirect } from "next/navigation"
import { Kanban } from "lucide-react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTickets } from "@/lib/actions/tickets"
import { getAllUsers } from "@/lib/actions/usuarios"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoUsers } from "@/lib/mock-data"
import { ROLE_HIERARCHY } from "@/types"
import { PipelineFilters } from "@/components/pipeline/pipeline-filters"
import { PipelinePageBoard } from "@/components/pipeline/pipeline-page-board"
import { PipelineCalendarView } from "@/components/pipeline/pipeline-calendar-view"
import { Button } from "@/components/ui/button"
import type { TicketPriority } from "@/types"

export const metadata = {
  title: "Pipeline",
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ tecnico?: string; prioridad?: string; view?: string }>
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
  const currentView = params.view === "calendar" ? "calendar" : "board"

  const buildViewHref = (view: "board" | "calendar") => {
    const query = new URLSearchParams()
    if (params.tecnico) query.set("tecnico", params.tecnico)
    if (params.prioridad) query.set("prioridad", params.prioridad)
    if (view === "calendar") query.set("view", "calendar")
    const qs = query.toString()
    return qs ? `/dashboard/pipeline?${qs}` : "/dashboard/pipeline"
  }

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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
            <Button asChild size="sm" variant={currentView === "board" ? "default" : "ghost"}>
              <Link href={buildViewHref("board")}>Kanban</Link>
            </Button>
            <Button asChild size="sm" variant={currentView === "calendar" ? "default" : "ghost"}>
              <Link href={buildViewHref("calendar")}>Calendario</Link>
            </Button>
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
      </div>

      {/* Board */}
      {currentView === "calendar" ? <PipelineCalendarView tickets={tickets} /> : <PipelinePageBoard tickets={tickets} />}
    </div>
  )
}
