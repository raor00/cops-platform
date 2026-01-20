import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soluciones",
  description:
    "Automatización, seguridad electrónica y energía para entornos enterprise. 28 años de trayectoria y +1500 obras ejecutadas.",
  openGraph: {
    title: "COP’S Electronics | Soluciones",
    description:
      "Soluciones enterprise en automatización, seguridad electrónica y energía. 28 años de trayectoria.",
    url: "/soluciones",
    type: "website",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "COP’S Electronics | Soluciones" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Soluciones",
    description:
      "Automatización, seguridad y energía para banca, industria y gobierno. 28 años de trayectoria.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
