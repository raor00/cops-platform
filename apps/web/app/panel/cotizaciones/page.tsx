import Link from "next/link";
import { redirect } from "next/navigation";
import { getCotizacionesAppUrl } from "../../../lib/moduleLinks";

export default function CotizacionesPage() {
  const cotizacionesUrl = getCotizacionesAppUrl();

  if (cotizacionesUrl) {
    redirect(cotizacionesUrl);
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
        <code className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-white">COTIZACIONES_APP_URL</code>
      </div>

      <div className="mt-4">
        <Link href="/panel" className="btn-glass">
          Volver al portal
        </Link>
      </div>
    </section>
  );
}
