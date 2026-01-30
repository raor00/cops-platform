// components/home/HomeCta.tsx
import Link from "next/link";

export default function HomeCta() {
  return (
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
              Solicitar consultoría gratuita
            </Link>
            <p className="mt-3 text-xs text-white/60">
              Respuesta por correo • Enfoque enterprise • Documentación
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
