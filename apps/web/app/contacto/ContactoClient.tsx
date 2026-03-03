"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mvzzrkjd";

const fadeUp = {
  initial: { opacity: 0, y: 30, filter: "blur(5px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, amount: 0.15 as const },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
};

export default function ContactoClient() {
  const router = useRouter();
  const { t } = useLanguage();
  const tc = t.contacto;
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
      if (!res.ok) { const data = await res.json().catch(() => null); throw new Error(data?.errors?.[0]?.message || tc.errDefault); }
      form.reset();
      router.push("/gracias");
    } catch (err: unknown) { setErrorMsg((err as Error)?.message || tc.errSending); }
    finally { setLoading(false); }
  }

  return (
    <main className="bg-slate-50 flex flex-col font-sans text-slate-800 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-multiply opacity-20 blur-[100px] bg-blue-300"
          animate={{ x: [0, 20, 0], y: [0, 10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply opacity-20 blur-[100px] bg-cyan-300"
          animate={{ x: [0, -15, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <section className="relative z-10 pt-20 md:pt-24 px-4 bg-transparent border-b border-transparent">
          <div className="mx-auto max-w-5xl text-center">
            <motion.div {...fadeUp} className="flex flex-col items-center">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 ring-1 ring-inset ring-blue-600/20 mb-3 uppercase tracking-widest">
                {tc.badge}
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
                {tc.h1} <span className="bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text text-transparent">{tc.h1highlight}</span>
              </h1>
              <p className="max-w-2xl text-sm md:text-base font-medium text-slate-600 leading-relaxed mx-auto">
                {tc.desc}
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-4xl w-full px-4 py-8 mb-2">
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">

            {/* Info blocks */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <motion.div {...fadeUp} className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tc.infoSupport}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{tc.infoEmail}</p>
                </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-4 border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{tc.infoHQ}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{tc.infoCity}</p>
                </div>
              </motion.div>
            </div>

            {/* Form */}
            <div className="lg:col-span-8">
              <motion.form
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-[1.5rem] border border-slate-200 shadow-lg p-6 space-y-4"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{tc.labelName}</label>
                    <input name="nombre" required maxLength={100} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder={tc.placeholderName} />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{tc.labelCompany}</label>
                    <input name="empresa" maxLength={100} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder={tc.placeholderCompany} />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{tc.labelEmail}</label>
                  <input type="email" name="email" required maxLength={150} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10" placeholder={tc.placeholderEmail} />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{tc.labelMessage}</label>
                  <textarea name="mensaje" required maxLength={2000} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10 resize-none" rows={3} placeholder={tc.placeholderMessage} />
                </div>

                {/* Honeypot — hidden from real users, catches bots */}
                <input name="_gotcha" type="text" tabIndex={-1} aria-hidden="true" className="hidden" />

                {errorMsg && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-medium text-red-600">
                    {errorMsg}
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 text-center sm:text-left flex-1">
                    {tc.legal}
                  </p>
                  <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-[13px] font-bold text-white shadow-md shadow-blue-500/30 transition-all hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        {tc.btnSending}
                      </span>
                    ) : tc.btnSend}
                  </button>
                </div>
              </motion.form>
            </div>

          </div>
        </section>
      </div>

    </main>
  );
}
