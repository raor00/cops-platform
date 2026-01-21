import "./globals.css";
import type { Metadata } from "next";

import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: {
    default: "COP’S Electronics | Soluciones Tecnológicas",
    template: "%s | COP’S Electronics",
  },
  description:
    "Automatización, seguridad electrónica y energía para banca nacional, proyectos enterprise y partners internacionales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
