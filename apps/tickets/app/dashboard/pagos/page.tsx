import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { isFirebaseMode, isLocalMode } from "@/lib/local-mode"
import { getDemoPaymentsView, getDemoUsers } from "@/lib/mock-data"
import { ROLE_HIERARCHY } from "@/types"
import { GenCuadroDialog } from "@/components/pagos/gen-cuadro-dialog"
import { PagosClient } from "./pagos-client"
import { getAdminFirestore } from "@/lib/firebase/admin"

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

  if (isFirebaseMode()) {
    const db = getAdminFirestore()
    const [paymentsSnap, ticketsSnap, usersSnap] = await Promise.all([
      db.collection("pagos").orderBy("fecha_habilitacion", "desc").get(),
      db.collection("tickets").get(),
      db.collection("users").get(),
    ])

    const tickets = new Map(ticketsSnap.docs.map((doc) => [doc.id, doc.data()]))
    const users = new Map(usersSnap.docs.map((doc) => [doc.id, doc.data()]))

    return paymentsSnap.docs.map((doc) => {
      const data = doc.data()
      const ticket = tickets.get(String(data.ticket_id))
      const tecnico = users.get(String(data.tecnico_id))

      return {
        id: doc.id,
        monto_a_pagar: Number(data.monto_a_pagar || 0),
        estado_pago: String(data.estado_pago || "pendiente"),
        fecha_habilitacion: String(data.fecha_habilitacion || data.created_at || new Date().toISOString()),
        fecha_pago: (data.fecha_pago as string | null) ?? null,
        metodo_pago: (data.metodo_pago as string | null) ?? null,
        referencia_pago: (data.referencia_pago as string | null) ?? null,
        ticket: {
          numero_ticket: String(ticket?.numero_ticket || "N/D"),
          asunto: String(ticket?.asunto || "Sin asunto"),
        },
        tecnico: {
          id: String(data.tecnico_id || ""),
          nombre: String(tecnico?.nombre || "Técnico"),
          apellido: String(tecnico?.apellido || ""),
        },
      }
    })
  }

  const { createClient } = await import("@/lib/supabase/server")
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

  if (isFirebaseMode()) {
    const snap = await getAdminFirestore()
      .collection("users")
      .where("rol", "==", "tecnico")
      .where("estado", "==", "activo")
      .orderBy("nombre")
      .get()

    return snap.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        nombre: String(data.nombre || ""),
        apellido: String(data.apellido || ""),
      }
    })
  }

  const { createClient } = await import("@/lib/supabase/server")
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
