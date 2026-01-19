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
    "Soluciones tecnológicas enfocadas en automatización de procesos y seguridad electrónica para proyectos de alta exigencia. Partners: Hikvision, Milestone, Invenzi, Ablerex, Automated Logic.",
  openGraph: {
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización de procesos y seguridad electrónica para proyectos enterprise y operación crítica.",
    siteName: "COP’S Electronics",
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización de procesos y seguridad electrónica para proyectos enterprise.",
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
              Solicitar diagnóstico
            </Link>
          </div>
        </header>

                <main>{children}</main>

        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-600">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>© {new Date().getFullYear()} COP’S Electronics. Todos los derechos reservados.</p>
              <p>Automatización • Seguridad electrónica • Integración</p>
            </div>
          </div>
        </footer>
      </body>
    </html>

  );
}