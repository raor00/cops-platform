import Link from "next/link";

type Logo = { src: string; alt: string };

export default function ClientShowcase({ title, subtitle, logos, featuredCount, href = "/proyectos", variant = "light" }: { title: string; subtitle: string; logos: Logo[]; featuredCount?: number; href?: string; variant?: "light" | "dark" }) {
  const isDark = variant === "dark";
  return (
    <section className={isDark ? "dark-section relative text-white" : "bg-white text-slate-900"}>
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="reveal flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className={isDark ? "text-[10px] font-bold tracking-[0.25em] text-brand-300" : "text-[10px] font-bold tracking-[0.25em] text-brand-600"}>{title}</p>
            <p className={isDark ? "mt-2 max-w-3xl text-sm text-white/60" : "mt-2 max-w-3xl text-sm text-slate-600"}>{subtitle}</p>
          </div>
          <Link href={href} className={isDark ? "shrink-0 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10" : "shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"}>Ver todo</Link>
        </div>
        <div className={isDark ? "reveal mt-8 rounded-3xl border border-white/8 bg-white/4 p-5" : "reveal mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5"}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {logos.map((l) => (
              <div key={l.alt} className={isDark ? "card-lift-dark flex items-center justify-center rounded-2xl border border-white/8 bg-white/4 p-4 transition" : "card-lift flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-4"}>
                <img src={l.src} alt={l.alt} className="h-10 w-auto object-contain" />
              </div>
            ))}
          </div>
          {typeof featuredCount === "number" && (
            <p className={isDark ? "mt-4 text-xs text-white/40" : "mt-4 text-xs text-slate-500"}>+{featuredCount} clientes/implementaciones (muestra parcial).</p>
          )}
        </div>
      </div>
    </section>
  );
}
