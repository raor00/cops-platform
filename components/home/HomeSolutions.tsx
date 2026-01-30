// components/home/HomeSolutions.tsx
export default function HomeSolutions() {
  return (
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
  );
}
