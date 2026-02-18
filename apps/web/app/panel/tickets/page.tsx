import { redirect } from "next/navigation";
import { getTicketsAppUrl } from "../../../lib/moduleLinks";

export default function TicketsPage() {
  const ticketsUrl = getTicketsAppUrl();
  redirect(ticketsUrl);
}
