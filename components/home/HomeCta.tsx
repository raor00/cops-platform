import Link from "next/link";
export default function HomeCta() {
  return (
    <section className="dark-section noise relative overflow-hidden">
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-64 w-[500px] rounded-full bg-brand-500/8 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
        <div className="reveal grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <h2 className="text-3xl font-bold tracking-tight">¿Listo para evaluar tu operación y diseñar una solución robusta?</h2>
            <p className="mt-3 text-white/65">Coordinamos una reunión técnica para levantar requerimientos y proponer la arquitectura adecuada.</p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link href="/contacto" className="inline-flex w-full justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand-950 shadow-lg shadow-white/10 transition hover:shadow-xl md:w-auto">Solicitar consultoría gratuita</Link>
            <p className="mt-3 text-xs text-white/45">Respuesta por correo • Enfoque enterprise • Documentación</p>
          </div>
        </div>
      </div>
    </section>
  );
}
