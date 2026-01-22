import Link from "next/link";

const PARTNERS = [
  {
    name: "Milestone Systems",
    logo: "/partners/milestone.png",
    desc:
      "Plataforma VMS para operación multi-sede, control por roles y auditoría en entornos corporativos y críticos.",
    bullets: ["Arquitectura escalable", "Control por roles", "Auditoría y trazabilidad"],
  },
  {
    name: "Winsted",
    logo: "/partners/winsted.png",
    desc:
      "Diseño y fabricación de mobiliario técnico para centros de control, NOC/SOC y salas de monitoreo.",
    bullets: ["Salas de control", "Ergonomía y operación", "Diseño para operación 24/7"],
  },
  {
    name: "Invenzi",
    logo: "/partners/invenzi.png",
    desc:
      "Control de acceso y gestión de identidades/visitantes para ambientes regulados y de alta exigencia operativa.",
    bullets: ["Accesos por zonas", "Gestión de visitantes", "Reportería"],
  },
  {
    name: "Altronix",
    logo: "/partners/altronix.png",
    desc:
      "Soluciones de energía y control para infraestructura de seguridad: alimentación, distribución y protección.",
    bullets: ["Alimentación y distribución", "Protección y confiabilidad", "Integración en sistemas"],
  },
  {
    name: "Automated Logic",
    logo: "/partners/automated-logic.png",
    desc:
      "Automatización y gestión de edificios (BMS) para control, monitoreo y eficiencia operacional.",
    bullets: ["BMS y monitoreo", "Alarmas y control", "Optimización energética"],
  },
  {
    name: "Velasea",
    logo: "/partners/velasea.png",
    desc:
      "Soluciones especializadas para operación e integración tecnológica orientada a proyectos de alta exigencia.",
    bullets: ["Soporte a proyectos", "Integración", "Operación y continuidad"],
    
  },
   {
    name: "Magos",
    logo: "/partners/magos.png",
    desc:
      "Soluciones complementarias para fortalecimiento de operación y seguridad, orientadas a entornos enterprise y despliegues multi-sede.",
    bullets: ["Enterprise", "Integración", "Operación"],
  },
   {
    name: "Digital Watchdog",
    logo: "/partners/digital.png",
    desc: "Tecnología enfocada en gestión de video y monitoreo (VMS), ideal para arquitecturas escalables y entornos de operación crítica.",
    bullets: ["VMS", "Monitoreo", "Escalabilidad"],
  },
];

export default function Partners() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Ecosistema tecnológico
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            Partners internacionales
          </h1>
          <p className="mt-4 max-w-3xl text-slate-700">
            Trabajamos con fabricantes y plataformas líderes para diseñar, implementar e integrar
            soluciones enterprise en automatización, seguridad electrónica y energía.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white hover:opacity-90"
            >
              Agendar reunión técnica
            </Link>
            <Link
              href="/proyectos"
              className="rounded-xl border px-5 py-3 text-center text-sm font-semibold hover:bg-white"
            >
              Ver proyectos
            </Link>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-2">
          {PARTNERS.map((p) => (
            <article key={p.name} className="rounded-2xl border bg-white p-6 hover:bg-slate-50">
              <div className="flex items-center gap-4">
                <img src={p.logo} alt={p.name} className="h-10 w-auto" />
                <div>
                  <h2 className="text-lg font-semibold">{p.name}</h2>
                  <p className="mt-1 text-sm text-slate-700">{p.desc}</p>
                </div>
              </div>

              <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {p.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className="mt-6">
                <Link
                  href="/contacto"
                  className="inline-flex rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-white"
                >
                  Solicitar propuesta
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
