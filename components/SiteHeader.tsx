import Link from "next/link";

const NAV = [
  { href: "/soluciones", label: "Soluciones" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/partners", label: "Partners" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Marca */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <img
                src="/branding/logo.png"
                alt="COP’S Electronics"
                className="h-10 w-auto"
              />
              <div className="leading-tight">
                <p className="text-lg font-semibold">COP’S ELECTRONICS, S.A.</p>
                <p className="text-sm text-white/70">28 años de trayectoria ininterrumpida</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/75">
              Asesoría e implementación de proyectos tecnológicos de alta gama en automatización,
              seguridad electrónica y energía, dirigidos a sectores industriales, bancarios,
              comerciales e instituciones gubernamentales.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contacto"
                className="inline-flex justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 hover:opacity-90"
              >
                Agendar reunión técnica
              </Link>
              <Link
                href="/proyectos"
                className="inline-flex justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Ver proyectos
              </Link>
            </div>
          </div>

          {/* Navegación */}
          <div className="md:col-span-3 md:col-start-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Navegación
            </p>
            <nav className="mt-4 grid gap-3">
              {NAV.map((i) => (
                <Link
                  key={i.href}
                  href={i.href}
                  className="text-sm font-semibold text-white/85 hover:text-white"
                >
                  {i.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Partners mini */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Partners
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {[
                { src: "/partners/milestone.png", alt: "Milestone" },
                { src: "/partners/winsted.png", alt: "Winsted" },
                { src: "/partners/invenzi.png", alt: "Invenzi" },
                { src: "/partners/altronix.png", alt: "Altronix" },
                { src: "/partners/automated-logic.png", alt: "Automated Logic" },
                { src: "/partners/velasea.png", alt: "Velasea" },
              ].map((l) => (
                <div
                  key={l.alt}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <img src={l.src} alt={l.alt} className="h-6 w-auto opacity-90" />
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-white/60">
              *Marcas y logos pertenecen a sus respectivos propietarios.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} COP’S ELECTRONICS, S.A. Todos los derechos reservados.</p>
          <p className="text-white/60">
            Banca nacional • Proyectos enterprise • Partners internacionales
          </p>
        </div>
      </div>
    </footer>
  );
}
