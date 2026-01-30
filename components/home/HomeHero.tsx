import Link from "next/link";

type Stat = { k: string; v: string };

const STATS: Stat[] = [
  { k: "Banca nacional", v: "Operación crítica" },
  { k: "Partners internacionales", v: "Ecosistema premium" },
  { k: "Proyectos enterprise", v: "Escala multi-sede" },
];

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Fondo abstract tecnológico */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 opacity-70">
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -left-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -right-24 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-slate-950" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-12 md:py-24">
        {/* Stats laterales */}
        <aside className="order-2 md:order-1 md:col-span-3">
          <div className="grid gap-4">
            {STATS.map((s) => (
              <div
                key={s.k}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"
              >
                <p className="text-xs font-medium text-white/70">{s.k}</p>
                <p className="mt-1 text-sm font-semibold">{s.v}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Copy central */}
        <div className="order-1 md:order-2 md:col-span-6">
          <p className="text-xs font-semibold tracking-widest text-white/70">
            COP’S ELECTRONICS, S.A.
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Arquitectura e integración para operación crítica
          </h1>

          <p className="mt-5 text-lg text-white/80">
            Diseñamos y ejecutamos plataformas para monitoreo, control y continuidad: VMS/CCTV,
            control de acceso, BMS, analíticas y energía. Enfocado en entornos donde cada evento
            debe ser auditable y cada sede debe operar bajo estándar.
          </p>

          {/* Diferencial (sin “28 años / 1500 obras”) */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
              NUESTRA TENDENCIA
            </p>
            <p className="mt-2 text-sm text-white/75 leading-relaxed">
              No entregamos “instalación”: entregamos <span className="font-semibold text-white">operación lista</span>.
              Levantamiento, arquitectura, integración multi-marca, documentación, QA y acompañamiento
              post-puesta en marcha.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 hover:opacity-90"
            >
              Solicitar consultoría gratuita
            </Link>
            <Link
              href="/soluciones#metodologia"
              className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
            >
              Ver metodología
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/60">
            Enfoque enterprise: estándares • roles • auditoría • multi-sede • continuidad
          </p>
        </div>
      </div>
    </section>
  );
}
