import "./globals.css";
import type { Metadata } from "next";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata = {
  metadataBase: new URL("https://cops-electronics-site-hxk7mat37-raor00s-projects.vercel.app/"), // o tu .vercel.app mientras pruebas
  title: {
    default: "COP’S Electronics | Soluciones tecnológicas enterprise",
    template: "%s | COP’S Electronics",
  },
  description:
    "Automatización, seguridad electrónica y energía para operación crítica. Proyectos enterprise para banca, industria y comercio.",
  openGraph: {
    title: "COP’S Electronics",
    description:
      "Automatización, seguridad electrónica y energía para operación crítica.",
    url: "https://TU-DOMINIO.com",
    siteName: "COP’S Electronics",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};
