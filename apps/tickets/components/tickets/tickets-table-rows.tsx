"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, MoreHorizontal, FolderKanban, Wrench, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import {
  STATUS_LABELS,
  STATUS_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  type Ticket,
} from "@/types"

interface TicketsTableRowsProps {
  tickets: Ticket[]
  canEdit: boolean
  page: number
  totalPages: number
  total: number
}

export function TicketsTableRows({ tickets, canEdit, page, totalPages, total }: TicketsTableRowsProps) {
  const router = useRouter()

  return (
    <>
      <tbody>
        {tickets.map((ticket) => (
          <tr
            key={ticket.id}
            onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
            className="group/row ticket-row-hover cursor-pointer"
          >
            <td>
              <div className="font-medium text-sky-600 group-hover/row:text-sky-700 transition-colors">
                {ticket.numero_ticket}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                {ticket.tipo === "proyecto" ? (
                  <><FolderKanban className="h-3 w-3" /> Proyecto</>
                ) : (
                  <><Wrench className="h-3 w-3" /> Servicio</>
                )}
              </div>
            </td>
            <td>
              <div className="font-medium text-slate-900">{ticket.cliente_nombre}</div>
              {ticket.cliente_empresa && (
                <div className="text-xs text-slate-500">{ticket.cliente_empresa}</div>
              )}
            </td>
            <td>
              <div className="max-w-[200px] truncate">{ticket.asunto}</div>
            </td>
            <td>
              <Badge className={STATUS_COLORS[ticket.estado]}>
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
                <div className="text-sm text-slate-700">
                  {ticket.tecnico.nombre} {ticket.tecnico.apellido}
                </div>
              ) : (
                <span className="text-slate-400 text-sm">Sin asignar</span>
              )}
            </td>
            <td>
              <div className="text-sm text-slate-700">{formatDate(ticket.created_at)}</div>
            </td>
            <td className="text-right" onClick={(e) => e.stopPropagation()}>
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
      {totalPages > 1 && (
        <tfoot>
          <tr>
            <td colSpan={8} className="px-0 py-0">
              <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                <div className="text-sm text-slate-500">
                  Mostrando {(page - 1) * 10 + 1} a {Math.min(page * 10, total)} de {total} tickets
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                    {page > 1 ? (
                      <Link href={`/dashboard/tickets?page=${page - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Link>
                    ) : (
                      <><ChevronLeft className="h-4 w-4 mr-1" />Anterior</>
                    )}
                  </Button>
                  <span className="text-sm text-slate-600 px-2">
                    Página {page} de {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                    {page < totalPages ? (
                      <Link href={`/dashboard/tickets?page=${page + 1}`}>
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    ) : (
                      <>Siguiente<ChevronRight className="h-4 w-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      )}
    </>
  )
}
