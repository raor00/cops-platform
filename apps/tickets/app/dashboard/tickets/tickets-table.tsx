import Link from "next/link"
import { 
  Ticket as TicketIcon, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTickets } from "@/lib/actions/tickets"
import { getCurrentUser } from "@/lib/actions/auth"
import { formatDate, formatCurrency } from "@/lib/utils"
import { 
  STATUS_LABELS, 
  STATUS_COLORS, 
  PRIORITY_LABELS,
  PRIORITY_COLORS, 
  ROLE_HIERARCHY,
  type TicketStatus,
  type TicketPriority,
} from "@/types"

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
  const canEdit = user && ROLE_HIERARCHY[user.rol] >= 3

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
    <div>
      {/* Table */}
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
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="group/row transition-colors hover:bg-white/[0.04]">
                <td>
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors duration-150 underline-offset-2 hover:underline"
                  >
                    {ticket.numero_ticket}
                  </Link>
                  <div className="text-xs text-white/50 mt-0.5">
                    {ticket.tipo === "proyecto" ? "🗂 Proyecto" : "🔧 Servicio"}
                  </div>
                </td>
                <td>
                  <div className="font-medium text-white">{ticket.cliente_nombre}</div>
                  {ticket.cliente_empresa && (
                    <div className="text-xs text-white/50">{ticket.cliente_empresa}</div>
                  )}
                </td>
                <td>
                  <div className="max-w-[200px] truncate">{ticket.asunto}</div>
                </td>
                <td>
                  <Badge
                    className={`${STATUS_COLORS[ticket.estado]} transition-all duration-200 ${
                      ticket.estado === "en_progreso" ? "animate-pulse-subtle" : ""
                    }`}
                  >
                    {STATUS_LABELS[ticket.estado]}
                  </Badge>
                </td>
                <td>
                  <Badge className={PRIORITY_COLORS[ticket.prioridad]}>
                    {PRIORITY_LABELS[ticket.prioridad]}
                  </Badge>
                </td>
                <td>
                  {ticket.tecnico ? (
                    <div className="text-sm">
                      {ticket.tecnico.nombre} {ticket.tecnico.apellido}
                    </div>
                  ) : (
                    <span className="text-white/40 text-sm">Sin asignar</span>
                  )}
                </td>
                <td>
                  <div className="text-sm">{formatDate(ticket.created_at)}</div>
                </td>
                <td className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/tickets/${ticket.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </Link>
                      </DropdownMenuItem>
                      {canEdit && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/tickets/${ticket.id}?edit=true`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-400 focus:text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
          <div className="text-sm text-white/50">
            Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, total)} de {total} tickets
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/dashboard/tickets?page=${page - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Link>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </>
              )}
            </Button>
            <span className="text-sm text-white/60 px-2">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/dashboard/tickets?page=${page + 1}`}>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <>
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
