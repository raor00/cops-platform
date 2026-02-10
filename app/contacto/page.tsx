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
      <section className="dark-section noise relative border-b border-white/[0.06]">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <div className="reveal">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">CONTACTO</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">Hablemos de tu proyecto</h1>
            <p className="mt-3 text-white/55">Déjanos tu requerimiento y coordinamos una reunión técnica.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-16">
        <form onSubmit={handleSubmit} className="reveal lg-card space-y-5 p-7">
          <div>
            <label className="text-sm font-semibold text-white/80">Nombre</label>
            <input name="nombre" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Tu nombre" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white/80">Empresa</label>
            <input name="empresa" className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="Empresa / Institución" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white/80">Correo</label>
            <input type="email" name="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" placeholder="correo@empresa.com" />
          </div>
          <div>
            <label className="text-sm font-semibold text-white/80">Requerimiento</label>
            <textarea name="mensaje" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20" rows={5} placeholder="Cuéntanos qué necesitas (alcance, sedes, prioridades, etc.)" />
          </div>
          {errorMsg && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{errorMsg}</div>}
          <button type="submit" disabled={loading} className="btn-glass-primary w-full disabled:opacity-50">{loading ? "Enviando..." : "Enviar solicitud"}</button>
          <p className="text-xs text-white/40">Al enviar este formulario aceptas ser contactado por nuestro equipo.</p>
        </form>
      </section>
    </div>
  );
}
