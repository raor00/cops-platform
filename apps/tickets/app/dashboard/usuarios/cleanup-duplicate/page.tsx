import { redirect } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, Trash2, ArrowLeft, ShieldCheck } from "lucide-react"

import { getCurrentUser } from "@/lib/actions/auth"
import { deleteUserAction } from "@/lib/actions/usuarios"
import { ROLE_HIERARCHY } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Limpieza temporal de usuario duplicado",
}

const DUPLICATE_UID = "TlSaADcuavfdfETlhdju4mwxoA52"
const CANONICAL_UID = "ZhlKLUX8MNOucwS3jjdb2kQvmvt1"

export default async function CleanupDuplicateUserPage() {
  const user = await getCurrentUser()

  if (!user || ROLE_HIERARCHY[user.rol] < 2) {
    redirect("/dashboard")
  }

  async function removeDuplicateUser() {
    "use server"

    const currentUser = await getCurrentUser()
    if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 2) {
      redirect("/dashboard")
    }

    const result = await deleteUserAction(DUPLICATE_UID)

    if (!result.success) {
      redirect(`/dashboard/usuarios?cleanup=error&message=${encodeURIComponent(result.error || "No se pudo eliminar el usuario duplicado")}`)
    }

    redirect(`/dashboard/usuarios?cleanup=success&deleted=${DUPLICATE_UID}&kept=${CANONICAL_UID}`)
  }

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Limpieza temporal de usuario duplicado</h1>
          <p className="page-description">Ejecuta esta acción una sola vez y luego retira la ruta temporal.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/usuarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Link>
        </Button>
      </div>

      <Card variant="glass" className="border-amber-300/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
            Acción temporal y destructiva
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p><strong>Se conserva:</strong> Luis Pita — UID <code>{CANONICAL_UID}</code></p>
            <p><strong>Se elimina:</strong> coordinacion / técnico — UID <code>{DUPLICATE_UID}</code></p>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Protección aplicada
            </div>
            <ul className="list-disc space-y-1 pl-5">
              <li>Solo gerente o superior puede abrir y ejecutar esta página.</li>
              <li>La acción elimina el documento Firestore del usuario duplicado.</li>
              <li>Si existe un usuario Auth con ese mismo UID, también intenta eliminarlo.</li>
            </ul>
          </div>

          <form action={removeDuplicateUser}>
            <Button type="submit" variant="destructive" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar usuario duplicado ahora
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
