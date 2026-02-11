import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCotizacionesAppUrl } from "../../../lib/moduleLinks";

export const dynamic = "force-dynamic";

export default async function CotizacionesPage() {
  const cotizacionesUrl = getCotizacionesAppUrl();

  if (cotizacionesUrl) {
    const reqHeaders = await headers();
    const currentHost = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host") ?? "";

    const targetHost = (() => {
      try {
        return new URL(cotizacionesUrl).host;
      } catch {
        return "";
      }
    })();

    const isSelfTarget = currentHost !== "" && targetHost === currentHost;

    if (!isSelfTarget) {
      redirect(cotizacionesUrl);
    }

    return (
      <section className="relative overflow-hidden lg-card p-6 md:p-8">
        <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-amber-500/20 blur-[80px]" />

        <span className="tag-glass">Modulo</span>
        <h1 className="mt-4 text-3xl font-semibold text-white">Cotizacion</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          La URL configurada para cotizaciones apunta al mismo proyecto web, por eso no cambia de modulo.
        </p>

        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold">Valor detectado:</p>
          <code className="mt-1 block break-all rounded bg-black/20 px-2 py-1 text-xs">{cotizacionesUrl}</code>
          <p className="mt-2">Debes colocar la URL del proyecto de cotizaciones en Vercel.</p>
        </div>

        <div className="mt-4">
          <Link href="/panel" className="btn-glass">
            Volver al portal
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden lg-card p-6 md:p-8">
      <div className="pointer-events-none absolute -top-16 right-0 h-52 w-52 rounded-full bg-brand-500/20 blur-[80px]" />

      <span className="tag-glass">Modulo</span>
      <h1 className="mt-4 text-3xl font-semibold text-white">Cotizacion</h1>
      <p className="mt-3 max-w-2xl text-white/60">
        Falta configurar la URL del modulo de cotizaciones para redirigir automaticamente.
      </p>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
        Configura en Vercel (proyecto web) la variable:
        <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-white">COTIZACIONES_APP_URL o cops_cotizaciones_key</code>
      </div>

      <div className="mt-4">
        <Link href="/panel" className="btn-glass">
          Volver al portal
        </Link>
      </div>
    </section>
  );
}
