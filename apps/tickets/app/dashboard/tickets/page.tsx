import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/actions/auth"
import { ROLE_HIERARCHY } from "@/types"
import { TicketsTable } from "./tickets-table"
import { TicketsFilters } from "./tickets-filters"

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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tickets</h1>
          <p className="page-description">
            Gestiona los servicios y proyectos
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

      {/* Filters */}
      <Card variant="glass" className="p-4 mb-6">
        <TicketsFilters 
          currentStatus={params.status}
          currentPriority={params.priority}
          currentSearch={params.search}
        />
      </Card>

      {/* Table */}
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
  )
}
