import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getTicketsAppUrl } from "../../../lib/moduleLinks";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  MASTER_USER_COOKIE,
  canAccessModule,
} from "../../../lib/masterAuth";
import {
  createTicketsBridgeToken,
  getTicketsBridgeSecret,
} from "../../../lib/ticketsBridge";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(MASTER_SESSION_COOKIE)?.value;
  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value;
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value ?? "admin";

  if (session !== MASTER_SESSION_VALUE || !canAccessModule(role, "tickets")) {
    redirect("/panel");
  }

  const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "");
  const bridgeSecret = getTicketsBridgeSecret();

  try {
    if (bridgeSecret) {
      // Intentar via bridge SSO con token firmado
      const token = createTicketsBridgeToken(
        { sub: username, role: role ?? "admin" },
        bridgeSecret,
      );
      const bridgeUrl = new URL("/auth/bridge", ticketsUrl);
      bridgeUrl.searchParams.set("token", token);
      redirect(bridgeUrl.toString());
    } else {
      // Sin secreto configurado: pasar directamente al dashboard con ?auth=1
      // El middleware de tickets acepta este parámetro para bootstrapear sesión
      redirect(ticketsUrl + "/dashboard?auth=1");
    }
  } catch {
    redirect(ticketsUrl + "/dashboard?auth=1");
  }
}
