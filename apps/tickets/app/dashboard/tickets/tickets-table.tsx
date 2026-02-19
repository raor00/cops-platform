import { Ticket as TicketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getTickets } from "@/lib/actions/tickets"
import { getCurrentUser } from "@/lib/actions/auth"
import {
  ROLE_HIERARCHY,
  type TicketStatus,
  type TicketPriority,
} from "@/types"
import { TicketsTableRows } from "@/components/tickets/tickets-table-rows"

interface TicketsTableProps {
  page: number
  status?: string
  priority?: string
  search?: string
}

export async function TicketsTable({ page, status, priority, search }: TicketsTableProps) {
  const user = await getCurrentUser()
  const result = await getTickets({
    page,
    pageSize: 10,
    status: status as TicketStatus | undefined,
    priority: priority as TicketPriority | undefined,
    search,
  })

  if (!result.success || !result.data) {
    return (
      <div className="p-6 text-center text-red-400">
        Error al cargar los tickets
      </div>
    )
  }

  const { data: tickets, total, totalPages } = result.data
  const canEdit = user ? ROLE_HIERARCHY[user.rol] >= 3 : false

  if (tickets.length === 0) {
    return (
      <div className="empty-state py-12">
        <TicketIcon className="empty-state-icon" />
        <p className="empty-state-title">No hay tickets</p>
        <p className="empty-state-description">
          {search || status || priority
            ? "No se encontraron tickets con los filtros seleccionados"
            : "Crea tu primer ticket para comenzar"}
        </p>
        {ROLE_HIERARCHY[user?.rol || "tecnico"] >= 2 && (
          <Button asChild className="mt-4">
            <Link href="/dashboard/tickets/nuevo">Crear Ticket</Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="table-glass table-row-stagger">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Cliente</th>
            <th>Asunto</th>
            <th>Estado</th>
            <th>Prioridad</th>
            <th>Técnico</th>
            <th>Fecha</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <TicketsTableRows
          tickets={tickets}
          canEdit={canEdit}
          page={page}
          totalPages={totalPages}
          total={total}
        />
      </table>
    </div>
  )
}
