"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";
import PartnerModal from "../../components/PartnerModal";
import { getPartners } from "../../data/partners";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 as const },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function PartnersPage() {
  const { locale, t } = useLanguage();
  const copy = t.partnersPage;
  const partners = useMemo(() => getPartners(locale), [locale]);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return partners;

    return partners.filter((partner) =>
      `${partner.name} ${partner.subtitle} ${partner.summary} ${partner.tags.join(" ")}`
        .toLowerCase()
        .includes(search),
    );
  }, [partners, q]);

  const selected = useMemo(
    () => partners.find((partner) => partner.id === selectedId) ?? null,
    [partners, selectedId],
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f4f6] font-sans text-slate-950">
      <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: ["0%", "-10%", "0%"], y: ["0%", "8%", "0%"], scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute left-[-15%] top-[-15%] h-[60vw] w-[60vw] rounded-full bg-blue-500/15 blur-[120px]"
        />
        <motion.div
          animate={{ x: ["0%", "10%", "0%"], y: ["0%", "-8%", "0%"], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute right-[-15%] top-[15%] h-[50vw] w-[50vw] rounded-full bg-indigo-500/15 blur-[120px]"
        />
      </div>

      <section className="relative z-10 border-b border-slate-300 bg-white/60 pb-20 pt-20 shadow-sm backdrop-blur-xl md:pb-28 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-30 [background-size:24px_24px]" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-block rounded-full border border-blue-200 bg-blue-100 px-4 py-1.5 text-[11px] font-black tracking-[0.2em] text-blue-700 shadow-sm">
              {copy.badge}
            </span>
            <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm md:text-5xl lg:text-6xl">
              {copy.title}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {copy.titleHighlight}
              </span>
            </h1>
            <p className="mb-10 text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
              {copy.description}
            </p>
            <div className="relative z-20 mx-auto max-w-xl">
              <label className="sr-only text-sm font-semibold text-slate-600">
                {copy.searchLabel}
              </label>
              <div className="relative">
                <input
                  value={q}
                  onChange={(event) => setQ(event.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-full border border-slate-300 bg-white/90 px-6 py-4 text-[15px] font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((partner) => (
                <motion.article
                  key={partner.id}
                  variants={staggerItem}
                  layout
                  onClick={() => setSelectedId(partner.id)}
                  whileTap={{ scale: 0.97 }}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(partner.id);
                    }
                  }}
                  className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative z-10 mb-5 flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-2 shadow-sm transition-all duration-500 group-hover:-rotate-2 group-hover:scale-105 group-hover:shadow-md md:h-20 md:w-20">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={180}
                        height={180}
                        className="h-full w-full object-contain opacity-80 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="mt-1 min-w-0 flex-1">
                      <h2 className="truncate text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-blue-700">
                        {partner.name}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-slate-500 transition-colors duration-300 group-hover:text-slate-600">
                        {partner.subtitle}
                      </p>
                    </div>
                  </div>

                  <p className="relative z-10 mt-2 line-clamp-3 text-[14px] font-medium leading-relaxed text-slate-600">
                    {partner.summary}
                  </p>

                  <div className="relative z-10 mt-6 flex flex-wrap gap-1.5">
                    {partner.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-colors duration-300 group-hover:border-blue-200 group-hover:bg-blue-100/50 group-hover:text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="relative z-10 mt-auto flex items-center justify-between pt-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 transition-colors duration-300 group-hover:text-blue-400">
                      {copy.enterpriseLabel}
                    </span>
                    <div className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition-all duration-300 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                      {copy.viewDetails}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="ml-2 h-4 w-4 opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-500">{copy.noResults}</p>
            </div>
          )}
        </div>
      </section>

      <PartnerModal
        partner={selected}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
