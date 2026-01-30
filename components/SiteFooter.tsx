import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          
          {/* Columna 1: Empresa */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img
                src="/public/branding/cops.png"
                alt="COP’S Electronics"
                className="h-8 w-auto"
              />
              <span className="font-semibold text-slate-900">
                COP’S Electronics
              </span>
            </div>

            <p className="text-sm leading-relaxed">
              Empresa privada con 28 años de trayectoria dedicada a la
              asesoría e implementación de proyectos tecnológicos de alta gama
              en automatización, seguridad y energía.
            </p>

            <p className="mt-3 text-xs text-slate-500">
              Partners: Milestone · Winsted · Invenzi · Altronix · Automated Logic · Velasea · Magos · Digital Watchdog
            </p>
          </div>

          {/* Columna 2: Soluciones */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Soluciones
            </h4>
            <ul className="space-y-2 text-sm">
              <li>Seguridad electrónica integral</li>
              <li>VMS / Gestión de video</li>
              <li>Control de acceso</li>
              <li>Edificios inteligentes (BMS)</li>
              <li>Energía y respaldo</li>
            </ul>
          </div>

          {/* Columna 3: Sectores */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Sectores
            </h4>
            <ul className="space-y-2 text-sm">
              <li>Banca</li>
              <li>Industrial</li>
              <li>Comercial</li>
              <li>Gubernamental</li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900">
              Contacto
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contacto" className="hover:underline">
                  Solicitar consultoría gratuita
                </Link>
              </li>
              <li>Atención por correo</li>
              <li>Caracas, Venezuela</li>
            </ul>
          </div>

        </div>

        {/* Línea inferior */}
        <div className="mt-10 border-t border-slate-200 pt-6 text-xs flex flex-col gap-2 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} COP’S Electronics, S.A.  
            Todos los derechos reservados.
          </span>
          <span className="text-slate-500">
            Automatización · Seguridad · Energía
          </span>
        </div>
      </div>
    </footer>
  );
}
