import { cookies } from "next/headers";
import CircuitNetwork from "../../components/new-home/CircuitNetwork";
import ModuleCardClient from "./ModuleCardClient";
import {
  MASTER_ROLE_COOKIE,
  MASTER_USER_COOKIE,
  getVisibleModules,
} from "../../lib/masterAuth";
import { getCotizacionesAppUrl, getTicketsAppUrl } from "../../lib/moduleLinks";
import { createTicketsBridgeToken, getTicketsBridgeSecret } from "../../lib/ticketsBridge";

export default async function PanelHomePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value;
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value ?? "Operador";

  const cotizacionesHref = getCotizacionesAppUrl();

  // Generate tickets URL directly — no intermediate /panel/tickets page
  const ticketsUrl = getTicketsAppUrl().replace(/\/$/, "");
  const bridgeSecret = getTicketsBridgeSecret();
  let ticketsHref: string;
  if (bridgeSecret) {
    const token = createTicketsBridgeToken(
      { sub: username, role: role ?? "admin" },
      bridgeSecret,
    );
    const bridgeUrl = new URL("/auth/bridge", ticketsUrl);
    bridgeUrl.searchParams.set("token", token);
    ticketsHref = bridgeUrl.toString();
  } else {
    ticketsHref = ticketsUrl + "/dashboard";
  }

  const modules = getVisibleModules(role).map((module) => {
    if (module.id === "cotizaciones") return { ...module, href: cotizacionesHref };
    if (module.id === "tickets") return { ...module, href: ticketsHref };
    return module;
  });

  return (
    <div className="relative w-full flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated background — full screen, same as login */}
      <div className="fixed inset-0 z-0">
        <CircuitNetwork />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(14,165,233,0.12),transparent_80%)]" />

      {/* Main Content */}
      <section className="relative z-10 w-full max-w-5xl px-4 py-12 text-center flex flex-col items-center justify-center">

        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
          </span>
          Sesión Activa: {username}
        </span>

        <h1 className="text-3xl font-black text-white drop-shadow-md sm:text-4xl">Centro de Operaciones</h1>
        <p className="mt-3 max-w-xl text-sm font-medium text-slate-400">
          Selecciona el módulo correspondiente para gestionar servicios, tickets o componentes administrativos de la plataforma.
        </p>

        <div className="mt-12 grid w-full gap-5 sm:px-10 md:grid-cols-3 max-w-4xl mx-auto">
          {modules.map((module) => (
            <ModuleCardClient key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
