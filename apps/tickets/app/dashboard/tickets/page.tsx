import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTickets } from "@/lib/actions/tickets"
import { ROLE_HIERARCHY } from "@/types"
import { TicketsTable } from "./tickets-table"
import { TicketsFilters } from "./tickets-filters"
import { TechnicianMobileList } from "@/components/tickets/technician-mobile-list"
import type { TicketStatus } from "@/types"

export const metadata = {
  title: "Tickets",
}

function TicketsTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 skeleton rounded-xl" />
      ))}
    </div>
  )
}

function MobileCardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-28 skeleton rounded-2xl" />
      ))}
    </div>
  )
}

// Server component that fetches data for the mobile view
async function TechnicianMobileTickets({
  status,
  priority,
  search,
  tecnicoId,
}: {
  status?: string
  priority?: string
  search?: string
  tecnicoId: string
}) {
  const result = await getTickets({
    pageSize: 50,
    status: status as TicketStatus | undefined,
    priority,
    search,
    tecnicoId,
  })
  const tickets = result.data?.data ?? []
  return <TechnicianMobileList tickets={tickets} currentStatus={status} />
}

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    priority?: string
    search?: string
  }>
}) {
  const user = await getCurrentUser()
  const params = await searchParams
  const canCreateTickets = user && ROLE_HIERARCHY[user.rol] >= 2
  const isTecnico = user?.rol === "tecnico"

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-description">
            {isTecnico ? "Tus servicios y proyectos asignados" : "Gestiona los servicios y proyectos"}
          </p>
        </div>
        {canCreateTickets && (
          <div className="page-actions">
            <Button asChild>
              <Link href="/dashboard/tickets/nuevo">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ticket
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Filters — shown on desktop always; on mobile only for non-technicians */}
      <Card variant="glass" className={`p-4 mb-6 ${isTecnico ? "hidden md:block" : ""}`}>
        <TicketsFilters
          currentStatus={params.status}
          currentPriority={params.priority}
          currentSearch={params.search}
        />
      </Card>

      {isTecnico && user ? (
        <>
          {/* Mobile: card view for technicians */}
          <div className="md:hidden">
            <Suspense fallback={<MobileCardSkeleton />}>
              <TechnicianMobileTickets
                status={params.status}
                priority={params.priority}
                search={params.search}
                tecnicoId={user.id}
              />
            </Suspense>
          </div>

          {/* Desktop: standard table */}
          <div className="hidden md:block">
            <Card variant="glass" className="overflow-hidden">
              <Suspense fallback={<div className="p-6"><TicketsTableSkeleton /></div>}>
                <TicketsTable
                  page={params.page ? parseInt(params.page) : 1}
                  status={params.status}
                  priority={params.priority}
                  search={params.search}
                />
              </Suspense>
            </Card>
          </div>
        </>
      ) : (
        /* Non-technician: always show table */
        <Card variant="glass" className="overflow-hidden">
          <Suspense fallback={<div className="p-6"><TicketsTableSkeleton /></div>}>
            <TicketsTable
              page={params.page ? parseInt(params.page) : 1}
              status={params.status}
              priority={params.priority}
              search={params.search}
            />
          </Suspense>
        </Card>
      )}
    </div>
  )
}
