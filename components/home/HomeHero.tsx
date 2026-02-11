import Link from "next/link";

const STATS = [
  { k: "Banca nacional", v: "Operación crítica" },
  { k: "Partners internacionales", v: "Ecosistema premium" },
  { k: "Proyectos enterprise",     v: "Escala multi-sede" },
];

export default function HomeHero() {
  return (
    <section className="hero-mesh noise relative overflow-hidden border-b border-white/[0.06]">
      {/* Liquid glass flowing orbs */}
      <div className="liquid-orb liquid-orb-1 -top-20 left-[10%] h-[500px] w-[500px] bg-brand-500/20" />
      <div className="liquid-orb liquid-orb-2 top-20 right-[5%] h-[400px] w-[400px] bg-brand-400/15" style={{ animationDelay: "-4s" }} />
      <div className="liquid-orb liquid-orb-3 bottom-[-40px] left-[40%] h-[450px] w-[450px] bg-violet-500/10" style={{ animationDelay: "-8s" }} />
      <div className="liquid-orb liquid-orb-1 top-[30%] right-[20%] h-[300px] w-[300px] bg-blue-400/10" style={{ animationDelay: "-12s" }} />

      <div className="pointer-events-none absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050a18]/40 to-[#050a18]/80" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-12 md:py-28">
        <aside className="order-2 md:order-1 md:col-span-3">
          <div className="reveal-stagger grid gap-4">
            {STATS.map((s) => (
              <div key={s.k} className="reveal lg-card card-lift-dark p-5 text-white">
                <p className="text-xs font-medium text-brand-300">{s.k}</p>
                <p className="mt-1 text-sm font-semibold">{s.v}</p>
              </div>
            ))}
          </div>
        </aside>

        <div className="order-1 md:order-2 md:col-span-9 lg:col-span-6">
          <div className="reveal">
            <span className="tag-glass">COP&apos;S ELECTRONICS, S.A.</span>
          </div>
          <h1 className="reveal mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl">
            Arquitectura e integración para <span className="text-gradient">operación crítica</span>
          </h1>
          <p className="reveal mt-6 text-lg leading-relaxed text-white/70">
            Diseñamos y ejecutamos plataformas para monitoreo, control y continuidad: VMS/CCTV, control de acceso, BMS, analíticas y energía. Enfocado en entornos donde cada evento debe ser auditable y cada sede debe operar bajo estándar.
          </p>
          <div className="reveal mt-7 lg-card p-5">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">NUESTRA TENDENCIA</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">No entregamos &quot;instalación&quot;: entregamos <span className="font-semibold text-white">operación lista</span>. Levantamiento, arquitectura, integración multi-marca, documentación, QA y acompañamiento post-puesta en marcha.</p>
          </div>
          <div className="reveal mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contacto" className="btn-glass-primary">Solicitar consultoría gratuita</Link>
            <Link href="/soluciones#metodologia" className="btn-glass">Ver metodología</Link>
          </div>
          <p className="reveal mt-7 text-xs text-white/40">Enfoque enterprise: estándares &bull; roles &bull; auditoría &bull; multi-sede &bull; continuidad</p>
        </div>
      </div>
    </section>
  );
}
