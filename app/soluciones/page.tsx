export default function Soluciones() {
  const items = [
    {
      title: "Seguridad Electrónica Integral",
      desc: "Diseño e implementación de videovigilancia, analítica, almacenamiento, monitoreo y operación para entornos críticos.",
    },
    {
      title: "Plataformas VMS / Gestión de Video",
      desc: "Arquitectura, despliegue y estandarización para operación multi-sede con control de permisos y auditoría.",
    },
    {
      title: "Control de Acceso e Identidades",
      desc: "Gestión de credenciales, visitantes, reglas de acceso, reportes y trazabilidad para ambientes corporativos.",
    },
    {
      title: "Automatización de Edificios (BMS)",
      desc: "Monitoreo y control de infraestructura: alarmas, eficiencia energética, operación y optimización continua.",
    },
    {
      title: "Integración e Interoperabilidad",
      desc: "Integración entre plataformas y tecnologías para centralizar operación y generar visibilidad con dashboards.",
    },
    {
      title: "Continuidad Operativa",
      desc: "Diseño y soporte para alta disponibilidad, resiliencia, energía crítica y protección de operación.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Soluciones</h1>
      <p className="mt-3 text-slate-700">
        Enfoque enterprise: escalabilidad, operación continua, documentación y soporte.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <div key={s.title} className="rounded-2xl border p-6 hover:bg-slate-50">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
