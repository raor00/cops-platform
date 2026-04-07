import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import CircuitNetwork from "../../components/new-home/CircuitNetwork";
import ModuleCardClient from "./ModuleCardClient";
import {
  MASTER_ROLE_COOKIE,
  MASTER_USER_COOKIE,
  getVisibleModules,
} from "../../lib/masterAuth";
import { getCotizacionesAppUrl, getTicketsAppUrl } from "../../lib/moduleLinks";
import { createTicketsBridgeToken, getTicketsBridgeSecret } from "../../lib/ticketsBridge";

const BRIDGE_ERROR_MESSAGES: Record<string, string> = {
  missing_secret: "El módulo Tickets no está configurado para SSO. Contacta al administrador (falta PLATFORM_TICKETS_BRIDGE_SECRET).",
  "missing-secret": "El módulo Tickets no está configurado para SSO. Contacta al administrador (falta PLATFORM_TICKETS_BRIDGE_SECRET).",
  invalid_signature: "Token de acceso inválido. Intenta de nuevo.",
  "invalid-signature": "Token de acceso inválido. Intenta de nuevo.",
  expired: "El token de acceso expiró. Intenta de nuevo.",
  no_token: "No se pudo generar el acceso. Intenta de nuevo.",
}

interface PanelHomePageProps {
  searchParams: Promise<{ bridge_error?: string }>
}

export default async function PanelHomePage({ searchParams }: PanelHomePageProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get(MASTER_ROLE_COOKIE)?.value;
  const username = cookieStore.get(MASTER_USER_COOKIE)?.value ?? "Operador";
  const { bridge_error } = await searchParams;
  const bridgeErrorMsg = bridge_error ? (BRIDGE_ERROR_MESSAGES[bridge_error] ?? "Error al acceder al módulo. Intenta de nuevo.") : null;

  const cotizacionesHref = getCotizacionesAppUrl();

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
    // No bridge secret — go directly; user will need to log in to tickets separately
    ticketsHref = ticketsUrl + "/dashboard";
  }

  const modules = getVisibleModules(role).map((module) => {
    if (module.id === "cotizaciones") return { ...module, href: cotizacionesHref };
    if (module.id === "tickets") return { ...module, href: ticketsHref };
    return module;
  });

  return (
    <div className="relative w-full flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="fixed inset-0 z-0">
        <CircuitNetwork />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(14,165,233,0.12),transparent_80%)]" />

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

        {/* Bridge error banner */}
        {bridgeErrorMsg && (
          <div className="mt-6 w-full max-w-xl rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-left">
            <span className="font-semibold">Error de acceso: </span>{bridgeErrorMsg}
          </div>
        )}

        {/* No bridge secret warning — only visible when secret is missing */}
        {!bridgeSecret && (
          <div className="mt-6 w-full max-w-xl rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300 text-left">
            <span className="font-semibold">Aviso: </span>
            El acceso directo a Tickets no tiene SSO configurado. Necesitarás iniciar sesión en Tickets por separado.
            <br />
            <span className="text-xs text-amber-400/70 mt-1 block">Configura <code>PLATFORM_TICKETS_BRIDGE_SECRET</code> en ambas apps de Vercel para habilitar SSO.</span>
          </div>
        )}

        <div className="mt-12 grid w-full gap-5 sm:px-10 md:grid-cols-3 max-w-4xl mx-auto">
          {modules.map((module) => (
            <ModuleCardClient key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
