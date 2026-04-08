import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, KeyRound, ShieldCheck, Wrench } from "lucide-react"
import { revalidatePath } from "next/cache"

import { getCurrentUser } from "@/lib/actions/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ROLE_HIERARCHY } from "@/types"
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin"

export const metadata = {
  title: "Reparar login coordinación",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

const CANONICAL_UID = "ZhlKLUX8MNOucwS3jjdb2kQvmvt1"
const CANONICAL_EMAIL = "coordinacion@copselectronics.com"

interface RepairPageProps {
  searchParams?: Promise<{
    status?: string
    message?: string
  }>
}

export default async function RepairCoordinationLoginPage({ searchParams }: RepairPageProps) {
  const user = await getCurrentUser()
  if (!user || ROLE_HIERARCHY[user.rol] < 2) {
    redirect("/dashboard")
  }

  const params = await searchParams

  async function repairLogin(formData: FormData) {
    "use server"

    const currentUser = await getCurrentUser()
    if (!currentUser || ROLE_HIERARCHY[currentUser.rol] < 2) {
      redirect("/dashboard")
    }

    const password = String(formData.get("password") || "").trim()
    const confirmPassword = String(formData.get("confirmPassword") || "").trim()

    if (password.length < 6) {
      redirect("/dashboard/usuarios/repair-coordination-login?status=error&message=" + encodeURIComponent("La contraseña debe tener al menos 6 caracteres"))
    }

    if (password !== confirmPassword) {
      redirect("/dashboard/usuarios/repair-coordination-login?status=error&message=" + encodeURIComponent("Las contraseñas no coinciden"))
    }

    try {
      const auth = getAdminAuth()
      const db = getAdminFirestore()

      const profileRef = db.collection("users").doc(CANONICAL_UID)
      const profileDoc = await profileRef.get()
      if (!profileDoc.exists) {
        redirect("/dashboard/usuarios/repair-coordination-login?status=error&message=" + encodeURIComponent("No existe el perfil Firestore de Luis Pita"))
      }

      try {
        const existingByEmail = await auth.getUserByEmail(CANONICAL_EMAIL)
        if (existingByEmail.uid !== CANONICAL_UID) {
          redirect("/dashboard/usuarios/repair-coordination-login?status=error&message=" + encodeURIComponent(`El correo ya está asociado en Auth al UID ${existingByEmail.uid}`))
        }
      } catch {
        // ok: email free or same uid will be handled below
      }

      try {
        await auth.getUser(CANONICAL_UID)
        await auth.updateUser(CANONICAL_UID, {
          email: CANONICAL_EMAIL,
          password,
          emailVerified: true,
          disabled: false,
        })
      } catch {
        await auth.createUser({
          uid: CANONICAL_UID,
          email: CANONICAL_EMAIL,
          password,
          emailVerified: true,
          disabled: false,
        })
      }

      await profileRef.update({
        email: CANONICAL_EMAIL,
        estado: "activo",
        updated_at: new Date().toISOString(),
      })

      revalidatePath("/dashboard/usuarios")
      revalidatePath(`/dashboard/usuarios/${CANONICAL_UID}`)

      redirect("/dashboard/usuarios/repair-coordination-login?status=success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo reparar el login"
      redirect("/dashboard/usuarios/repair-coordination-login?status=error&message=" + encodeURIComponent(message))
    }
  }

  const isSuccess = params?.status === "success"
  const isError = params?.status === "error"

  return (
    <div className="page-container max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reparar login de coordinación</h1>
          <p className="page-description">Ruta temporal para re-alinear Firebase Auth con el perfil correcto de Luis Pita.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/usuarios">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Link>
        </Button>
      </div>

      {isSuccess && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Login reparado. Ya puedes entrar con <strong>{CANONICAL_EMAIL}</strong> usando la nueva contraseña.
        </div>
      )}

      {isError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {params?.message || "No se pudo reparar el login."}
        </div>
      )}

      <Card variant="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Wrench className="h-5 w-5" />
            Reparación temporal de acceso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <p><strong>Usuario correcto:</strong> Luis Pita</p>
            <p><strong>UID:</strong> <code>{CANONICAL_UID}</code></p>
            <p><strong>Correo:</strong> <code>{CANONICAL_EMAIL}</code></p>
          </div>

          <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4" />
              Qué hará esta acción
            </div>
            <ul className="list-disc space-y-1 pl-5">
              <li>Crea o actualiza el usuario en Firebase Auth con el UID correcto.</li>
              <li>Asigna el correo de coordinación al UID de Luis Pita.</li>
              <li>Actualiza el perfil Firestore para dejarlo activo y consistente.</li>
            </ul>
          </div>

          <form action={repairLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input id="password" name="password" type="password" minLength={6} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" minLength={6} required />
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              <KeyRound className="mr-2 h-4 w-4" />
              Reparar login ahora
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
