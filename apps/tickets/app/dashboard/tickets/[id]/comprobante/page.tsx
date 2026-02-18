import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { getTicketById } from "@/lib/actions/tickets"
import { ROLE_HIERARCHY } from "@/types"
import { ComprobanteView } from "./comprobante-view"

interface ComprobantePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ComprobantePageProps) {
  const { id } = await params
  const result = await getTicketById(id)
  if (!result.success || !result.data) return { title: "Comprobante" }
  return { title: `Comprobante - ${result.data.numero_ticket}` }
}

export default async function ComprobantePage({ params }: ComprobantePageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) redirect("/login")
  if (ROLE_HIERARCHY[user.rol] < 2) redirect("/dashboard")

  const result = await getTicketById(id)
  if (!result.success || !result.data) notFound()

  const ticket = result.data

  // Solo disponible para tickets finalizados
  if (ticket.estado !== "finalizado") {
    redirect(`/dashboard/tickets/${id}`)
  }

  return <ComprobanteView ticket={ticket} emisor={user} />
}
