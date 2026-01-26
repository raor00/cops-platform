"use client";

import { useMemo, useState } from "react";

type Logo = { src: string; alt: string; tone?: "dark" | "light" };


export default function ClientShowcase({
  title = "HAN CONFIADO EN COP’S",
  subtitle = "Organizaciones que han trabajado con COP’S a lo largo de los años.",
  logos,
  featuredCount = 10,
}: {
  title?: string;
  subtitle?: string;
  logos: Logo[];
  featuredCount?: number;
}) {
  const [open, setOpen] = useState(false);

  const featured = useMemo(() => logos.slice(0, featuredCount), [logos, featuredCount]);
  const rest = useMemo(() => logos.slice(featuredCount), [logos, featuredCount]);
    const [spot, setSpot] = useState({ x: 50, y: 50 });

  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-white/60">{title}</p>
          <p className="mt-2 text-sm text-white/60">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
        >
          Ver todos
        </button>
      </div>

    <div
  className="relative mt-5 rounded-3xl border border-white/10 bg-white/5 p-4"
  onMouseMove={(e) => {
    const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setSpot({ x, y });
  }}
>
  {/* spotlight */}
  <div
    className="pointer-events-none absolute inset-0 rounded-3xl opacity-70"
    style={{
      background: `radial-gradient(600px circle at ${spot.x}% ${spot.y}%, rgba(255,255,255,0.10), transparent 55%)`,
    }}
  />

  <div className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
    {featured.map((c) => (
      <div
        key={c.src}
        className="flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-6 transition hover:border-white/20 hover:bg-black/10"
        title={c.alt}
      >
        <img
          src={c.src}
          alt={c.alt}
          className="h-12 w-auto object-contain opacity-100 grayscale-0 transition hover:scale-105"
          loading="lazy"
        />
      </div>
    ))}
  </div>
</div>


      {/* Modal: ver todos */}
      {open && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-white/60">{title}</p>
                <p className="mt-2 text-sm text-white/60">
                  Visualiza todas las organizaciones (actuales e históricas).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-5 grid max-h-[60vh] grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {logos.map((c) => (
                <div
                  key={`all-${c.src}`}
                  className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                  title={c.alt}
                >
                  <img
                    src={c.src}
                    alt={c.alt}
                    className="h-12 w-auto object-contain opacity-100 grayscale-0 transition duration-300 group-hover:scale-105"

                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-white/45">
              *Algunas marcas pueden corresponder a empresas históricas o reestructuradas con el tiempo.
            </p>
          </div>
        </div>
      )}
    </div>
    </section>
  );
}
