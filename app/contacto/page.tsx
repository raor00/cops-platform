"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzrkjd";

export default function Contacto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append("_subject", "Nuevo contacto - COP'S Electronics");
      const res = await fetch(FORMSPREE_ENDPOINT, { method: "POST", body: formData, headers: { Accept: "application/json" } });
      if (!res.ok) { const data = await res.json().catch(() => null); throw new Error(data?.errors?.[0]?.message || "No se pudo enviar. Intenta de nuevo."); }
      form.reset();
      router.push("/gracias");
    } catch (err: any) { setErrorMsg(err?.message || "Error al enviar."); }
    finally { setLoading(false); }
  }

  return (
    <div>
      {/* Dark hero */}
      <section className="dark-section noise relative border-b border-white/8">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="reveal">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">CONTACTO</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Hablemos de tu proyecto</h1>
            <p className="mt-3 text-white/65">Déjanos tu requerimiento y coordinamos una reunión técnica.</p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-2xl px-4 py-16">
        <form onSubmit={handleSubmit} className="reveal space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div>
            <label className="text-sm font-semibold text-slate-700">Nombre</label>
            <input name="nombre" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Empresa</label>
            <input name="empresa" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="Empresa / Institución" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Correo</label>
            <input type="email" name="email" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" placeholder="correo@empresa.com" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Requerimiento</label>
            <textarea name="mensaje" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100" rows={5} placeholder="Cuéntanos qué necesitas (alcance, sedes, prioridades, etc.)" />
          </div>
          {errorMsg && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</div>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500 disabled:opacity-50">{loading ? "Enviando..." : "Enviar solicitud"}</button>
          <p className="text-xs text-slate-500">Al enviar este formulario aceptas ser contactado por nuestro equipo.</p>
        </form>
      </section>
    </div>
  );
}
