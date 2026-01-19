import Link from "next/link";

const SOLUTIONS = [
  {
    title: "Seguridad Electrónica Integral",
    desc: "Videovigilancia, analítica, almacenamiento, monitoreo y operación para entornos críticos.",
  },
  {
    title: "Control de Acceso e Identidades",
    desc: "Gestión de credenciales, visitantes, auditoría y reglas de acceso con trazabilidad.",
  },
  {
    title: "Automatización de Edificios y Energía",
    desc: "BMS, monitoreo, alarmas y optimización de operación para eficiencia y continuidad.",
  },
  {
    title: "Integración de Plataformas",
    desc: "Centralización, interoperabilidad y dashboards conectando múltiples tecnologías.",
  },
  {
    title: "Continuidad Operativa",
    desc: "Diseño y soporte para alta disponibilidad, resiliencia y protección de operación.",
  },
  {
    title: "Ingeniería e Implementación",
    desc: "Levantamiento, diseño, despliegue, documentación, puesta en marcha y soporte.",
  },
];

const PARTNERS = ["Hikvision", "Milestone", "Invenzi", "Ablerex", "Automated Logic"];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="text-sm font-medium text-slate-600">
              Soluciones tecnológicas • Automatización • Seguridad electrónica
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Proyectos enterprise para automatización y seguridad a escala
            </h1>
            <p className="mt-5 text-lg text-slate-700">
              Diseñamos, integramos e implementamos plataformas críticas para organizaciones
              de alta exigencia, incluyendo banca nacional y grandes operaciones.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contacto"
                className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white hover:opacity-90"
              >
                Solicitar diagnóstico
              </Link>
              <Link
                href="/proyectos"
                className="rounded-xl border px-5 py-3 text-center text-sm font-medium hover:bg-slate-50"
              >
                Ver capacidades y proyectos
              </Link>
            </div>

            <div className="mt-10 rounded-2xl border bg-slate-50 p-5">
              <p className="text-sm font-medium">Lo que cuidamos en cada implementación</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
                <li>Escalabilidad multi-sede y operación continua.</li>
                <li>Documentación, trazabilidad y buenas prácticas.</li>
                <li>Integración real entre marcas y plataformas.</li>
              </ul>
            </div>
          </div>

          {/* BLOQUE VISUAL SIMULADO */}
          <div className="rounded-3xl border bg-gradient-to-b from-slate-50 to-white p-8">
            <p className="text-sm font-medium text-slate-600">Ecosistema de partners</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {PARTNERS.map((p) => (
                <div
                  key={p}
                  className="rounded-2xl border bg-white p-4 text-center text-sm font-medium"
                >
                  {p}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-5">
              <p className="text-sm font-medium">Sectores atendidos</p>
              <p className="mt-2 text-sm text-slate-700">
                Banca • Corporativo • Infraestructura crítica • Operaciones multi-sede
              </p>
            </div>
          </div>
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
