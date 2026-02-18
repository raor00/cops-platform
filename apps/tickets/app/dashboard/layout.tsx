import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/actions/auth"
import { DashboardLayoutClient } from "./layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
}
