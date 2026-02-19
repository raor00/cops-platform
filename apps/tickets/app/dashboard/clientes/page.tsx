import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { getClientes } from "@/lib/actions/clientes"
import { hasPermission } from "@/types"
import { ClientesClient } from "@/components/clientes/clientes-client"

export default async function ClientesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (!hasPermission(user.rol, "clients:view")) redirect("/dashboard")

  const result = await getClientes({ page: 1, pageSize: 50 })

  if (!result.success || !result.data) {
    return (
      <div className="page-container">
        <p className="text-red-400">Error al cargar clientes: {result.error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <ClientesClient initialData={result.data} userRole={user.rol} />
    </div>
  )
}
