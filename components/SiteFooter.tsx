import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="dark-section noise relative border-t border-white/8 text-white">
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="text-lg font-bold text-white">COP&apos;S Electronics</span>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Empresa privada con 28 años de trayectoria dedicada a la asesoría e implementación de proyectos tecnológicos de alta gama en automatización, seguridad y energía.
            </p>
            <p className="mt-3 text-xs text-white/40">
              Partners: Milestone · Winsted · Invenzi · Altronix · Automated Logic · Velasea · Magos · Digital Watchdog
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-brand-300">Soluciones</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Seguridad electrónica integral</li>
              <li>VMS / Gestión de video</li>
              <li>Control de acceso</li>
              <li>Edificios inteligentes (BMS)</li>
              <li>Energía y respaldo</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-brand-300">Sectores</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Banca</li>
              <li>Industrial</li>
              <li>Comercial</li>
              <li>Gubernamental</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-brand-300">Contacto</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/contacto" className="text-brand-300 hover:text-brand-200 transition">Solicitar consultoría gratuita</Link></li>
              <li>Atención por correo</li>
              <li>Caracas, Venezuela</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/8 pt-6 text-xs sm:flex-row sm:justify-between">
          <span className="text-white/50">© {new Date().getFullYear()} COP&apos;S Electronics, S.A. Todos los derechos reservados.</span>
          <span className="text-white/40">Automatización · Seguridad · Energía</span>
        </div>
      </div>
    </footer>
  );
}
