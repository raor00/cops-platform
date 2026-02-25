import type { Metadata } from "next";
import "./globals.css";
import RevealProvider from "../components/RevealProvider";
import GlassProvider from "../components/GlassProvider";
import LayoutChrome from "../components/LayoutChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://cops-electronics-web.vercel.app"),
  title: {
    default: "COP'S Electronics | Soluciones tecnolÃ³gicas enterprise",
    template: "%s | COP'S Electronics",
  },
  description:
    "AutomatizaciÃ³n, seguridad electrÃ³nica y energÃ­a para operaciÃ³n crÃ­tica. Proyectos enterprise para banca, industria y comercio.",
  openGraph: {
    title: "COP'S Electronics",
    description:
      "AutomatizaciÃ³n, seguridad electrÃ³nica y energÃ­a para operaciÃ³n crÃ­tica.",
    url: "https://cops-electronics-web.vercel.app",
    siteName: "COP'S Electronics",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="antialiased">
      <body className="min-h-screen bg-[#050a18] text-slate-200">
        <GlassProvider />
        <RevealProvider />
        <LayoutChrome>{children}</LayoutChrome>
      </body>
    </html>
  );
}

