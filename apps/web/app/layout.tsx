import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import RevealProvider from "../components/RevealProvider";
import GlassProvider from "../components/GlassProvider";
import LayoutChrome from "../components/LayoutChrome";
import { LanguageProvider } from "../lib/i18n/context";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://copselectronics.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "COP'S Electronics | Soluciones tecnológicas enterprise",
    template: "%s | COP'S Electronics",
  },
  description:
    "BMS, energía crítica y VMS para operación enterprise. Diseñamos e integramos plataformas con continuidad operativa, trazabilidad y control centralizado.",
  openGraph: {
    title: "COP'S Electronics",
    description:
      "BMS, energía crítica y VMS para operación enterprise con continuidad operativa y control centralizado.",
    url: SITE_URL,
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

export const viewport: import("next").Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the LanguageProvider sets document.documentElement.lang
    // client-side after detecting browser locale, which differs from the server-rendered "es"
    <html lang="es" className={`antialiased ${outfit.className}`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#050a18] text-slate-200">
        <LanguageProvider>
          <GlassProvider />
          <RevealProvider />
          <LayoutChrome>{children}</LayoutChrome>
        </LanguageProvider>
      </body>
    </html>
  );
}
