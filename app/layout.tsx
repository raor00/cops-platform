import SiteHeader from "@/components/SiteHeader";
import "./globals.css";
import Link from "next/link";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "COP’S Electronics | Soluciones Tecnológicas",
    template: "%s | COP’S Electronics",
  },
  description:
    "Automatización de procesos, seguridad electrónica y energía para proyectos enterprise, banca nacional e infraestructura crítica.",
  openGraph: {
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización, seguridad electrónica y energía para banca nacional, proyectos enterprise y aliados internacionales.",
    url: "/",
    siteName: "COP’S Electronics",
    locale: "es_VE",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "COP’S Electronics | Automatización • Seguridad • Energía",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización, seguridad electrónica y energía para proyectos enterprise y banca nacional.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png", // o favicon.ico si usas ico
  },
};




export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-white text-slate-900">
        <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-semibold tracking-tight">
              COP’S Electronics
            </Link>

            <nav className="hidden gap-6 text-sm md:flex">
              <Link href="/soluciones" className="hover:underline">Soluciones</Link>
              <Link href="/proyectos" className="hover:underline">Proyectos</Link>
              <Link href="/partners" className="hover:underline">Partners</Link>
              <Link href="/nosotros" className="hover:underline">Nosotros</Link>
              <Link href="/contacto" className="hover:underline">Contacto</Link>
            </nav>

            <Link
              href="/contacto"
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Solicitar consultoría  gratuita
            </Link>
          </div>
        </header>

                <main>{children}</main>

        <footer className="border-t bg-white">
  <div className="mx-auto max-w-6xl px-4 py-12">
    <div className="grid gap-10 md:grid-cols-12">
      {/* Marca */}
      <div className="md:col-span-5">
        <div className="flex items-center gap-3">
          <img
            src="/branding/cops.png"
            alt="COP’S Electronics"
            className="h-9 w-auto"
          />
          <p className="font-semibold tracking-tight">COP’S Electronics</p>
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Organización privada con dos décadas de trayectoria dedicada a la asesoría e implementación
          de proyectos tecnológicos de alta gama en automatización, seguridad y energía.
        </p>

        <p className="mt-3 text-xs text-slate-500">
          Partners: Milestone • Winsted • Invenzi • Altronix • Automated Logic • Velazea
        </p>
      </div>

      {/* Soluciones */}
      <div className="md:col-span-3">
        <p className="text-sm font-semibold">Soluciones</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Seguridad electrónica integral</li>
          <li>VMS / Gestión de video</li>
          <li>Control de acceso</li>
          <li>Edificios inteligentes (BMS)</li>
          <li>Energía y respaldo</li>
        </ul>
      </div>

      {/* Sectores */}
      <div className="md:col-span-2">
        <p className="text-sm font-semibold">Sectores</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>Banca</li>
          <li>Industrial</li>
          <li>Comercial</li>
          <li>Gubernamental</li>
        </ul>
      </div>

      {/* Contacto */}
      <div className="md:col-span-2">
        <p className="text-sm font-semibold">Contacto</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>
            <a className="hover:underline" href="/contacto">
              Solicitar consultoría gratuita
            </a>
          </li>
          <li>Atención por correo</li>
          <li>Caracas, Venezuela</li>
        </ul>
      </div>
    </div>

    <div className="mt-10 flex flex-col gap-2 border-t pt-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
      <p>© {new Date().getFullYear()} COP’S Electronics, S.A. Todos los derechos reservados.</p>
      <p>Automatización • Seguridad • Energía</p>
    </div>
  </div>
</footer>

      </body>
    </html>

  );
}