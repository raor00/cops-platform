import { redirect } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { getCurrentUser } from "@/lib/actions/auth"
import { getPaymentsDashboardData, getPaymentTechnicians } from "@/lib/actions/pagos"
import { Card, CardContent } from "@/components/ui/card"
import { GenCuadroDialog } from "@/components/pagos/gen-cuadro-dialog"
import { PagosClient } from "./pagos-client"
import { ROLE_HIERARCHY } from "@/types"

export const metadata = { title: "Pagos" }

export default async function PagosPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 3) {
    redirect("/dashboard")
  }

  const [paymentsResult, techniciansResult] = await Promise.all([
    getPaymentsDashboardData(),
    getPaymentTechnicians(),
  ])

  const allPayments = paymentsResult.success ? paymentsResult.data ?? [] : []
  const technicians = techniciansResult.success ? techniciansResult.data ?? [] : []

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pagos a Técnicos</h1>
          <p className="page-description">Gestiona los pagos por servicios realizados</p>
        </div>
        <GenCuadroDialog technicians={technicians} />
      </div>

      {(!paymentsResult.success || !techniciansResult.success) && (
        <Card variant="glass" className="mb-6 border-amber-200/60">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-slate-900">No se pudieron cargar todos los datos de pagos</p>
              <p className="text-slate-600">
                {paymentsResult.error || techniciansResult.error || "Revisa la configuración o los logs del servidor."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <PagosClient allPayments={allPayments} technicians={technicians} />
    </div>
  )
}
