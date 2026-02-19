import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { generatePaymentSchedule } from "@/lib/actions/pagos"
import { ROLE_HIERARCHY } from "@/types"
import { CuadroPagos } from "@/components/pagos/cuadro-pagos"
import { BackButton } from "@/components/ui/back-button"

interface CuadroPageProps {
  searchParams: Promise<{ desde?: string; hasta?: string; tecnicoId?: string }>
}

export default async function CuadroPagosPage({ searchParams }: CuadroPageProps) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (ROLE_HIERARCHY[user.rol] < 3) redirect("/dashboard/pagos")

  const params = await searchParams

  const result = await generatePaymentSchedule({
    desde: params.desde,
    hasta: params.hasta,
    tecnicoId: params.tecnicoId,
    soloFinalizados: true,
  })

  if (!result.success || !result.data) {
    return (
      <div className="page-container">
        <BackButton href="/dashboard/pagos" />
        <p className="mt-4 text-red-400">Error al generar cuadro: {result.error}</p>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="mb-4 print:hidden">
        <BackButton href="/dashboard/pagos" />
      </div>
      <CuadroPagos report={result.data} />
    </div>
  )
}
