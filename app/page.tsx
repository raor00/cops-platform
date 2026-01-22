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

const CLIENTES = [
  { src: "/clientes/bancamiga.png", alt: "Bancamiga" },
  { src: "/clientes/bancaribe.png", alt: "Bancaribe" },
  { src: "/clientes/fvf.png", alt: "FVF" },
  { src: "/clientes/bigott.png", alt: "Cigarrera Bigott" },
  { src: "/clientes/plaza.png", alt: "Plaza" },
  { src: "/clientes/bfc.png", alt: "BFC" },
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
              Somos una empresa privada con dos décadas de trayectoria ininterrumpida dedicada
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
                Solicitar consultoría  gratuita
              </Link>
              <Link
                href="/proyectos"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver cómo trabajamos
              </Link>
            </div>

{/* Bloque: 28 años */}
<section className="relative border-t border-white/10 bg-slate-950/40">
  <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
      {/* Texto */}
      <div className="lg:col-span-7">
        <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
          TRAYECTORIA
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          28 años respaldando operación crítica en Venezuela
        </h2>
        <p className="mt-4 text-white/70 leading-relaxed">
          Somos una empresa privada con trayectoria ininterrumpida dedicada a la
          asesoría e implementación de proyectos tecnológicos de alta gama en
          automatización, seguridad y energía, con enfoque enterprise para banca, industria,
          comercio e instituciones gubernamentales.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            Banca nacional
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            Proyectos enterprise
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            Partners internacionales
          </span>
        </div>
      </div>

      {/* Métricas */}
      <div className="lg:col-span-5">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-semibold tracking-tight text-white">28+</p>
            <p className="mt-1 text-sm text-white/60">Años de trayectoria</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-semibold tracking-tight text-white">1500+</p>
            <p className="mt-1 text-sm text-white/60">Obras ejecutadas</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-3xl font-semibold tracking-tight text-white">Enterprise</p>
            <p className="mt-1 text-sm text-white/60">Arquitectura + implementación + soporte</p>
          </div>
        </div>
        {/* Confianza / Clientes */}
<div className="mt-10">
  <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
    HAN CONFIADO EN COP’S
  </p>

  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    {[
      { src: "/clientes/bancaribe.png", alt: "Bancaribe" },
      { src: "/clientes/bancamiga.png", alt: "Bancamiga" },
      { src: "/clientes/bfc.png", alt: "BFC" },
      { src: "/clientes/fvf.png", alt: "FVF" },
      { src: "/clientes/bigott.png", alt: "Bigott" },
      { src: "/clientes/plaza.png", alt: "Banco Plaza" },
    ].map((c) => (
      <div
        key={c.src}
        className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
      >
        <img
          src={c.src}
          alt={c.alt}
          className="h-8 w-auto object-contain opacity-80 grayscale"
        />
      </div>
    ))}
  </div>

  <p className="mt-3 text-xs text-white/50">
    *Algunas marcas pueden corresponder a empresas históricas o reestructuradas con el tiempo.
  </p>
</div>

      </div>
    </div>
  </div>
</section>



  {/* Partners tecnológicos (cinta full ancho) */}
<div className="mt-10">
  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/60">
    Partners tecnológicos
  </p>

  <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw]">
    <div className="group flex items-center justify-center rounded-2xl border border-white/10 bg-white/8 px-6 py-4 backdrop-blur transition hover:bg-white/12">
      <div className="logo-marquee__track gap-10">
        {/* Grupo 1 (largo) */}
        <div className="logo-marquee__group gap-10">
          {[
            { src: "/partners/milestone.png", alt: "Milestone" },
            { src: "/partners/winsted.png", alt: "Winsted" },
            { src: "/partners/invenzi.png", alt: "Invenzi" },
            { src: "/partners/altronix.png", alt: "Altronix" },
            { src: "/partners/automated-logic.png", alt: "Automated Logic" },
            { src: "/partners/velasea.png", alt: "Velasea" },
            { src: "/partners/magos.png", alt: "Magos" },
            { src: "/partners/digital.png", alt: "Digital" },


            // Repetimos de nuevo (para que la tanda sea más larga que la pantalla)
            { src: "/partners/milestone.png", alt: "Milestone 2" },
            { src: "/partners/winsted.png", alt: "Winsted 2" },
            { src: "/partners/invenzi.png", alt: "Invenzi 2" },
            { src: "/partners/altronix.png", alt: "Altronix 2" },
            { src: "/partners/automated-logic.png", alt: "Automated Logic 2" },
            { src: "/partners/velasea.png", alt: "Velasea 2" },
            { src: "/partners/magos.png", alt: "Magos 2" },
            { src: "/partners/digital.png", alt: "Digital 2" },
          ].map((l, idx) => (
            <div key={idx} className="logo-pill">
              <img src={l.src} alt={l.alt} className="logo-img" />
            </div>
          ))}
        </div>

        {/* Grupo 2 (idéntico) */}
        <div className="logo-marquee__group gap-10" aria-hidden="true">
          {[
            { src: "/partners/milestone.png", alt: "Milestone" },
            { src: "/partners/winsted.png", alt: "Winsted" },
            { src: "/partners/invenzi.png", alt: "Invenzi" },
            { src: "/partners/altronix.png", alt: "Altronix" },
            { src: "/partners/automated-logic.png", alt: "Automated Logic" },
            { src: "/partners/velasea.png", alt: "Velasea" },

            { src: "/partners/milestone.png", alt: "Milestone 2" },
            { src: "/partners/winsted.png", alt: "Winsted 2" },
            { src: "/partners/invenzi.png", alt: "Invenzi 2" },
            { src: "/partners/altronix.png", alt: "Altronix 2" },
            { src: "/partners/automated-logic.png", alt: "Automated Logic 2" },
            { src: "/partners/velasea.png", alt: "Velasea 2" },
          ].map((l, idx) => (
            <div key={idx} className="logo-pill">
              <img src={l.src} alt={l.alt} className="h-10 w-auto object-contain opacity-80 grayscale transition group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105"/>
            </div>
          ))}
        </div>
      </div>
    </div>
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
                  Partner: Milestone • Winsted • Invenzi • Altronix • Automated Logic • Velasea • Magos • Digital Watchdog
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

            {/* Sección: Por qué COP’S */}
<section className="bg-slate-950/40 border-t border-white/10">
  <div className="mx-auto max-w-6xl px-4 py-12">
    <p className="text-xs font-semibold tracking-[0.2em] text-white/60">
      DIFERENCIADORES
    </p>
    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
      Experiencia real en banca y operación crítica
    </h2>

    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {[
        {
          t: "Integración multi-marca",
          d: "Arquitecturas abiertas (VMS, control de acceso, CCTV, BMS, energía) sin depender de un solo fabricante.",
        },
        {
          t: "Escalabilidad enterprise",
          d: "Diseños listos para multi-sede, estandarización de modelos piloto y despliegue por fases.",
        },
        {
          t: "Soporte y continuidad",
          d: "Planificación, documentación y acompañamiento post-implementación para operación estable.",
        },
      ].map((s) => (
        <div
          key={s.t}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h3 className="text-base font-semibold tracking-tight text-white">
            {s.t}
          </h3>
          <p className="mt-3 text-sm text-white/60 leading-relaxed">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
</section>


            {/* Casos destacados */}
<section className="mx-auto max-w-6xl px-4 py-16">
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
        Proyectos enterprise
      </p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">
        Casos destacados (sin datos sensibles)
      </h2>
      <p className="mt-2 max-w-2xl text-slate-700">
        Experiencia en banca nacional, operación multi-sede e infraestructura crítica.
        Mostramos alcances tipo: arquitectura, integración y continuidad operativa.
      </p>
    </div>

    <div className="flex gap-3">
      <Link
        href="/proyectos"
        className="rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-white"
      >
        Ver todos los proyectos
      </Link>
      <Link
        href="/contacto"
        className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        Agendar reunión
      </Link>
    </div>
  </div>

  <div className="mt-10 grid gap-4 md:grid-cols-3">
    {[
      {
        t: "Operación multi-sede con VMS",
        s: "Banca",
        d: "Estandarización, control por roles y trazabilidad para monitoreo centralizado.",
        tags: ["Arquitectura", "Roles", "Auditoría"],
      },
      {
        t: "Control de acceso y visitantes",
        s: "Enterprise",
        d: "Zonificación, credenciales y reportes para cumplimiento y control operativo.",
        tags: ["Identidades", "Visitantes", "Reportes"],
      },
      {
        t: "Automatización y monitoreo (BMS)",
        s: "Infraestructura crítica",
        d: "Integración de señales, alarmas y tableros para continuidad operativa.",
        tags: ["Integración", "Alarmas", "Operación"],
      },
    ].map((x) => (
      <article key={x.t} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold">{x.t}</h3>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
            {x.s}
          </span>
        </div>

        <p className="mt-3 text-sm text-slate-700">{x.d}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {x.tags.map((t) => (
            <span key={t} className="rounded-full border px-3 py-1 text-xs text-slate-600">
              {t}
            </span>
          ))}
        </div>

            <div className="mt-6">
              <Link
                href="/proyectos"
                className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
              >
                Ver detalles
              </Link>
            </div>
          </article>
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
                      Solicitar consultoría  gratuita
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
