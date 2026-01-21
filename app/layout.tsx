import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "../components/SiteHeader";
// import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "COP’S Electronics | Soluciones Tecnológicas",
    template: "%s | COP’S Electronics",
  },
  description:
    "Automatización, seguridad electrónica y energía para banca nacional, proyectos enterprise y partners internacionales.",
  openGraph: {
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización, seguridad electrónica y energía para banca nacional, proyectos enterprise y partners internacionales.",
    url: "/",
    siteName: "COP’S Electronics",
    locale: "es_VE",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP’S Electronics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Soluciones Tecnológicas",
    description:
      "Automatización, seguridad electrónica y energía para banca nacional, proyectos enterprise y partners internacionales.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        <main>{children}</main>
        {/* <SiteFooter /> */}
      </body>
    </html>
  );
}
