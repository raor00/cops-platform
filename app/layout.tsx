import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import RevealProvider from "../components/RevealProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://cops-electronics-web.vercel.app"),
  title: {
    default: "COP'S Electronics | Soluciones tecnológicas enterprise",
    template: "%s | COP'S Electronics",
  },
  description:
    "Automatización, seguridad electrónica y energía para operación crítica. Proyectos enterprise para banca, industria y comercio.",
  openGraph: {
    title: "COP'S Electronics",
    description: "Automatización, seguridad electrónica y energía para operación crítica.",
    url: "https://cops-electronics-web.vercel.app",
    siteName: "COP'S Electronics",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "es_VE",
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="antialiased">
      <body className="min-h-screen bg-white text-slate-900">
        <RevealProvider />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
