import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTicketById } from "@/lib/actions/tickets"
import { getInspeccionByTicket } from "@/lib/actions/inspecciones"
import { InspeccionView } from "@/components/inspecciones/inspeccion-view"
import { ROLE_HIERARCHY } from "@/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InspeccionViewPage({ params }: PageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (ROLE_HIERARCHY[user.rol] < 2) {
    redirect("/dashboard")
  }

  const ticketResult = await getTicketById(id)
  if (!ticketResult.success || !ticketResult.data) {
    redirect("/dashboard/tickets")
  }

  const ticket = ticketResult.data

  const inspeccionResult = await getInspeccionByTicket(id)
  if (!inspeccionResult.success || !inspeccionResult.data) {
    redirect(`/dashboard/tickets/${id}/inspeccion`)
  }

  const inspeccion = inspeccionResult.data

  return <InspeccionView inspeccion={inspeccion} ticket={ticket} />
}
