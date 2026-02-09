import Link from "next/link";

type Stat = { k: string; v: string };

const STATS: Stat[] = [
  { k: "Banca nacional",          v: "Operación crítica" },
  { k: "Partners internacionales", v: "Ecosistema premium" },
  { k: "Proyectos enterprise",     v: "Escala multi-sede" },
];

export default function HomeHero() {
  return (
    <section className="hero-mesh noise relative overflow-hidden border-b border-brand-800/30">
      {/* Floating orbs */}
      <div className="orb -top-32 left-[15%] h-[420px] w-[420px] bg-brand-500/20" />
      <div className="orb top-28 right-[10%] h-[340px] w-[340px] bg-brand-300/15" style={{ animationDelay: "-5s" }} />
      <div className="orb bottom-[-60px] left-[45%] h-[380px] w-[380px] bg-brand-600/10" style={{ animationDelay: "-9s" }} />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient veil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-brand-950/60 to-brand-950" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-12 md:py-28">
        {/* Stats sidebar */}
        <aside className="order-2 md:order-1 md:col-span-3">
          <div className="reveal-stagger grid gap-4">
            {STATS.map((s) => (
              <div
                key={s.k}
                className="reveal card-lift rounded-2xl border border-white/10 bg-white/5 p-5 text-white backdrop-blur-sm"
              >
                <p className="text-xs font-medium text-brand-300">{s.k}</p>
                <p className="mt-1 text-sm font-semibold">{s.v}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main copy */}
        <div className="order-1 md:order-2 md:col-span-9 lg:col-span-6">
          <div className="reveal">
            <p className="text-xs font-semibold tracking-[0.2em] text-brand-300">
              COP&apos;S ELECTRONICS, S.A.
            </p>
          </div>

          <h1 className="reveal mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
            Arquitectura e integración para{" "}
            <span className="text-gradient">operación crítica</span>
          </h1>

          <p className="reveal mt-6 text-lg leading-relaxed text-white/80">
            Diseñamos y ejecutamos plataformas para monitoreo, control y continuidad: VMS/CCTV,
            control de acceso, BMS, analíticas y energía. Enfocado en entornos donde cada evento
            debe ser auditable y cada sede debe operar bajo estándar.
          </p>

          {/* Differentiator card */}
          <div className="reveal mt-7 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">
              NUESTRA TENDENCIA
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/75">
              No entregamos &quot;instalación&quot;: entregamos{" "}
              <span className="font-semibold text-white">operación lista</span>.
              Levantamiento, arquitectura, integración multi-marca, documentación, QA y acompañamiento
              post-puesta en marcha.
            </p>
          </div>

          <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-white px-6 py-3.5 text-center text-sm font-semibold text-brand-900 shadow-lg shadow-white/10 transition hover:shadow-xl hover:shadow-white/15"
            >
              Solicitar consultoría gratuita
            </Link>
            <Link
              href="/soluciones#metodologia"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-center text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Ver metodología
            </Link>
          </div>

          <p className="reveal mt-7 text-xs text-white/50">
            Enfoque enterprise: estándares • roles • auditoría • multi-sede • continuidad
          </p>
        </div>
      </div>
    </section>
  );
}
