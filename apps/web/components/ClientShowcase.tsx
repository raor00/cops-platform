import Link from "next/link";

type Logo = { src: string; alt: string };

export default function ClientShowcase({ title, subtitle, logos, featuredCount, href = "/proyectos" }: { title: string; subtitle: string; logos: Logo[]; featuredCount?: number; href?: string; variant?: "light" | "dark" }) {
  return (
    <section className="relative border-t border-white/[0.06] text-white">
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="reveal flex items-end justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.25em] text-brand-300">{title}</p>
            <p className="mt-2 max-w-3xl text-sm text-white/55">{subtitle}</p>
          </div>
          <Link href={href} className="btn-glass shrink-0 text-sm !px-4 !py-2">Ver todo</Link>
        </div>
        <div className="reveal mt-8 lg-card p-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {logos.map((l) => (
              <div key={l.alt} className="lg-card flex items-center justify-center p-4">
                <img src={l.src} alt={l.alt} className="h-10 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0" />
              </div>
            ))}
          </div>
          {typeof featuredCount === "number" && (
            <p className="mt-4 text-xs text-white/35">+{featuredCount} clientes/implementaciones (muestra parcial).</p>
          )}
        </div>
      </div>
    </section>
  );
}
