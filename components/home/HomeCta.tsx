import Link from "next/link";
export default function HomeCta() {
  return (
    <section className="dark-section noise relative overflow-hidden">
      <div className="liquid-orb liquid-orb-2 -bottom-20 right-1/4 h-[400px] w-[500px] bg-brand-500/10" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-white">
        <div className="reveal grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <h2 className="text-3xl font-bold tracking-tight">¿Listo para evaluar tu operación y diseñar una solución robusta?</h2>
            <p className="mt-3 text-white/55">Coordinamos una reunión técnica para levantar requerimientos y proponer la arquitectura adecuada.</p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link href="/contacto" className="btn-glass-primary w-full md:w-auto">Solicitar consultoría gratuita</Link>
            <p className="mt-3 text-xs text-white/40">Respuesta por correo &bull; Enfoque enterprise &bull; Documentación</p>
          </div>
        </div>
      </div>
    </section>
  );
}
