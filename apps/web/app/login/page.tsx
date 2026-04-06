import { redirect } from "next/navigation"
import { getTicketsAppUrl } from "../../lib/moduleLinks"

export default function LoginPage() {
  const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "")
  redirect(`${ticketsUrl}/login?redirect=web`)
}
