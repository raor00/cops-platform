import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "COP’S Electronics, S.A.: 28 años de trayectoria ininterrumpida en automatización, seguridad electrónica y energía. +1500 obras ejecutadas.",
  openGraph: {
    title: "COP’S Electronics | Nosotros",
    description:
      "28 años de trayectoria ininterrumpida. Proyectos enterprise en automatización, seguridad y energía.",
    url: "/nosotros",
    type: "website",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "COP’S Electronics | Nosotros" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Nosotros",
    description:
      "28 años de trayectoria ininterrumpida y +1500 obras ejecutadas. Enfoque enterprise.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
