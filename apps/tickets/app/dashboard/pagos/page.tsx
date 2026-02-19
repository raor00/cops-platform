import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { isLocalMode } from "@/lib/local-mode"
import { getDemoPaymentsView, getDemoUsers } from "@/lib/mock-data"
import { ROLE_HIERARCHY } from "@/types"
import { GenCuadroDialog } from "@/components/pagos/gen-cuadro-dialog"
import { PagosClient } from "./pagos-client"

export const metadata = { title: "Pagos" }

interface Payment {
  id: string
  monto_a_pagar: number
  estado_pago: string
  fecha_habilitacion: string
  fecha_pago: string | null
  metodo_pago: string | null
  referencia_pago: string | null
  ticket: { numero_ticket: string; asunto: string }
  tecnico: { id: string; nombre: string; apellido: string }
}

async function getAllPayments(): Promise<Payment[]> {
  if (isLocalMode()) {
    const demoPayments = getDemoPaymentsView()
    return [...demoPayments.pending, ...demoPayments.completed] as Payment[]
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("pagos_tecnicos")
    .select(`
      *,
      ticket:tickets(numero_ticket, asunto),
      tecnico:users!pagos_tecnicos_tecnico_id_fkey(id, nombre, apellido)
    `)
    .order("fecha_habilitacion", { ascending: false })

  return (data as Payment[]) || []
}

async function getTechnicians(): Promise<Array<{ id: string; nombre: string; apellido: string }>> {
  if (isLocalMode()) {
    return getDemoUsers()
      .filter((u) => u.rol === "tecnico" && u.estado === "activo")
      .map((u) => ({ id: u.id, nombre: u.nombre, apellido: u.apellido }))
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from("users")
    .select("id, nombre, apellido")
    .eq("rol", "tecnico")
    .order("nombre")

  return data || []
}

export default async function PagosPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 3) {
    redirect("/dashboard")
  }

  const allPayments = await getAllPayments()
  const technicians = await getTechnicians()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos a Técnicos</h1>
          <p className="page-description">Gestiona los pagos por servicios realizados</p>
        </div>
        <GenCuadroDialog technicians={technicians} />
      </div>

      <PagosClient allPayments={allPayments} technicians={technicians} />
    </div>
  )
}
