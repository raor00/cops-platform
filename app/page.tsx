import Link from "next/link";

const STATS = [
  { k: "Banca nacional", v: "Operación crítica" },
  { k: "Partners internacionales", v: "Ecosistema premium" },
  { k: "Proyectos enterprise", v: "Escala multi-sede" },
];

const SOLUTIONS = [
  {
    title: "Automatización industrial",
    desc: "Sistemas PLC, SCADA y control distribuido para procesos críticos.",
  },
  {
    title: "Seguridad electrónica",
    desc: "CCTV, control de accesos e integración con monitoreo centralizado.",
  },
  {
    title: "Energía y continuidad",
    desc: "Diseño de sistemas fotovoltaicos, UPS y respaldo para operación ininterrumpida.",
  },
];

export default function Home() {
  return (
    <div>
      {/* HERO PREMIUM */}
      <section className="relative overflow-hidden border-b">
        {/* Fondo abstract tecnológico (sin imagen) */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 opacity-70">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-24 -left-24 h-[420px] w-[420px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 -right-24 h-[520px] w-[520px] rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-slate-950" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-12 md:py-24">
          {/* Stats laterales (izquierda) */}
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
              Automatización, seguridad y energía para operación crítica
            </h1>

            <p className="mt-5 text-lg text-white/80">
              Somos una organización privada con dos décadas de trayectoria ininterrumpida dedicada
              a la asesoría de proyectos tecnológicos de alta gama en sistemas de automatización,
              energía renovable, seguridad y protección.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Dirigidos hacia los sectores industriales, bancarios, comerciales e instituciones
              gubernamentales. Hemos ejecutado más de <span className="font-semibold text-white">1500</span>{" "}
              obras que afianzan nuestra gestión técnica y comercial en relación a la promoción,
              instalación y mantenimiento de sistemas de seguridad integrales, automatización de
              procesos, edificios inteligentes y energía renovable.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contacto"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-slate-900 hover:opacity-90"
              >
                Solicitar diagnóstico
              </Link>
              <Link
                href="/proyectos"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver cómo trabajamos
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/60">
              Enfoque enterprise: levantamiento • arquitectura • implementación • puesta en marcha • soporte
            </p>
          </div>

          {/* Card derecha tipo “caso destacado” */}
          <aside className="order-3 md:order-3 md:col-span-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white">
              <p className="text-xs font-semibold text-white/70">Caso destacado</p>
              <p className="mt-2 text-sm font-semibold">
                Integración y estandarización para operaciones multi-sede
              </p>
              <p className="mt-3 text-sm text-white/70">
                Arquitecturas escalables, control por roles, auditoría y continuidad operativa
                orientada a entornos críticos.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs text-white/70">Sectores</p>
                <p className="mt-1 text-sm font-medium">
                  Banca • Industrial • Comercial • Gubernamental
                </p>
              </div>

              <div className="mt-5">
                <Link
                  href="/contacto"
                  className="inline-flex w-full justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:opacity-90"
                >
                  Agendar reunión técnica
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>


      {/* SOLUCIONES */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">Soluciones</h2>
            <p className="text-slate-700">
              Diseñadas para operación continua, escalabilidad y control.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {SOLUTIONS.map((s) => (
              <div key={s.title} className="rounded-2xl border p-6 hover:bg-slate-50">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/soluciones"
              className="text-sm font-medium underline underline-offset-4"
            >
              Ver todas las soluciones →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-3xl border bg-white p-8 md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              Agenda una reunión técnica
            </h2>
            <p className="mt-3 text-slate-700">
              Cuéntanos tu necesidad. Te proponemos un enfoque claro: levantamiento, arquitectura,
              implementación y soporte.
            </p>
            <div className="mt-6">
              <Link
                href="/contacto"
                className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:opacity-90"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
