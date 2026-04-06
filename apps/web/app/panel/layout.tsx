import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { MASTER_SESSION_COOKIE, MASTER_SESSION_VALUE } from "../../lib/masterAuth"
import { getTicketsAppUrl } from "../../lib/moduleLinks"
import type { ReactNode } from "react"

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get(MASTER_SESSION_COOKIE)?.value

  if (session !== MASTER_SESSION_VALUE) {
    const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "")
    redirect(`${ticketsUrl}/login?redirect=web`)
  }

  return <main className="w-full min-h-screen">{children}</main>
}
