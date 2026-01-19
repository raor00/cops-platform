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



            {/* Partners */}
<div className="mt-10">
  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
    Partners tecnológicos
  </p>

  <div className="flex flex-wrap items-center gap-6">
    <img
      src="/partners/hikvision.png"
      alt="Hikvision"
      className="h-7 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
    <img
      src="/partners/invenzi.png"
      alt="Invenzi"
      className="h-7 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
    <img
      src="/partners/milestone.png"
      alt="Milestone Systems"
      className="h-7 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
    <img
      src="/partners/ablerex.png"
      alt="Ablerex"
      className="h-7 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
  </div>
</div>


                  <p className="mt-6 text-xs text-white/60">
                    Enfoque enterprise: levantamiento • arquitectura • implementación • puesta en marcha • soporte
                  </p>
                </div>
              </div>
            </section>
      
                    {/* SERVICIOS */}
            <section className="mx-auto max-w-6xl px-4 py-16">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight">Soluciones</h2>
                  <p className="mt-2 text-slate-700">
                    Proyectos de alta exigencia en automatización, seguridad y energía, con enfoque enterprise.
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  Partner: Hikvision • Milestone • Invenzi • Ablerex • Automated Logic
                </div>
              </div>
      
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  {
                    t: "Seguridad Electrónica Integral",
                    d: "Diseño e implementación de soluciones robustas para operación crítica.",
                    b: ["CCTV & analítica", "Almacenamiento", "Monitoreo y operación"],
                  },
                  {
                    t: "VMS / Gestión de video",
                    d: "Estandarización y operación multi-sede con control por roles.",
                    b: ["Arquitectura", "Permisos", "Auditoría"],
                  },
                  {
                    t: "Control de Acceso",
                    d: "Identidades, visitantes, reglas y trazabilidad para cumplimiento.",
                    b: ["Credenciales", "Reportes", "Integraciones"],
                  },
                  {
                    t: "Edificios Inteligentes (BMS)",
                    d: "Monitoreo, control y optimización para infraestructura crítica.",
                    b: ["Alarmas", "Eficiencia", "Puesta en marcha"],
                  },
                  {
                    t: "Energía y Respaldo",
                    d: "Continuidad operativa con soluciones de energía para ambientes exigentes.",
                    b: ["Respaldo", "Protección", "Disponibilidad"],
                  },
                  {
                    t: "Integración e Interoperabilidad",
                    d: "Unificamos plataformas para operación centralizada y escalable.",
                    b: ["Dashboards", "Protocolos", "Automatización"],
                  },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
                    <h3 className="font-semibold">{x.t}</h3>
                    <p className="mt-2 text-sm text-slate-700">{x.d}</p>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
                      {x.b.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
      
            {/* SECTORES */}
            <section className="border-y bg-slate-50">
              <div className="mx-auto max-w-6xl px-4 py-16">
                <h2 className="text-3xl font-semibold tracking-tight">Sectores</h2>
                <p className="mt-2 text-slate-700">
                  Experiencia en entornos donde la disponibilidad, auditoría y continuidad operativa son prioridad.
                </p>
      
                <div className="mt-10 grid gap-4 md:grid-cols-4">
                  {[
                    { t: "Bancario", d: "Operación crítica, control por roles, trazabilidad y estándares." },
                    { t: "Industrial", d: "Seguridad, monitoreo, automatización y continuidad en planta." },
                    { t: "Comercial", d: "Protección integral, control de accesos, operación multi-sede." },
                    { t: "Gubernamental", d: "Implementaciones con enfoque en cumplimiento y operación robusta." },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border bg-white p-6">
                      <h3 className="font-semibold">{x.t}</h3>
                      <p className="mt-2 text-sm text-slate-700">{x.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
      
            {/* CÓMO TRABAJAMOS */}
            <section className="mx-auto max-w-6xl px-4 py-16">
              <h2 className="text-3xl font-semibold tracking-tight">Cómo trabajamos</h2>
              <p className="mt-2 text-slate-700">
                Metodología clara, documentación y control de calidad para proyectos enterprise.
              </p>
      
              <div className="mt-10 grid gap-4 md:grid-cols-5">
                {[
                  { n: "01", t: "Levantamiento", d: "Diagnóstico, requerimientos, riesgos y alcance." },
                  { n: "02", t: "Arquitectura", d: "Diseño técnico, capacidades y escalabilidad." },
                  { n: "03", t: "Implementación", d: "Instalación, integración y configuración." },
                  { n: "04", t: "Puesta en marcha", d: "Pruebas, QA, actas y capacitación." },
                  { n: "05", t: "Soporte", d: "Mantenimiento, mejoras y continuidad operativa." },
                ].map((x) => (
                  <div key={x.n} className="rounded-2xl border p-6">
                    <p className="text-xs font-semibold text-slate-500">{x.n}</p>
                    <h3 className="mt-2 font-semibold">{x.t}</h3>
                    <p className="mt-2 text-sm text-slate-700">{x.d}</p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* CTA FINAL */}
            <section className="bg-slate-950">
              <div className="mx-auto max-w-6xl px-4 py-16 text-white">
                <div className="grid gap-8 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-8">
                    <h2 className="text-3xl font-semibold tracking-tight">
                      ¿Listo para evaluar tu operación y diseñar una solución robusta?
                    </h2>
                    <p className="mt-3 text-white/75">
                      Coordinamos una reunión técnica para levantar requerimientos y proponer la arquitectura adecuada.
                    </p>
                  </div>
                  <div className="md:col-span-4 md:text-right">
                    <Link
                      href="/contacto"
                      className="inline-flex w-full justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:opacity-90 md:w-auto"
                    >
                      Solicitar diagnóstico
                    </Link>
                    <p className="mt-3 text-xs text-white/60">
                      Respuesta por correo • Enfoque enterprise • Documentación
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      }
