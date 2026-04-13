import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { getMyNotifications } from "@/lib/actions/notificaciones"
import { DashboardLayoutClient } from "./layout-client"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const notifications = (await getMyNotifications()).data ?? []

  return <DashboardLayoutClient user={user} initialNotifications={notifications}>{children}</DashboardLayoutClient>
}
