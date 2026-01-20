import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Casos tipo y experiencia en proyectos enterprise para banca nacional, industria e infraestructura crítica. 28 años de trayectoria.",
  openGraph: {
    title: "COP’S Electronics | Proyectos",
    description:
      "Experiencia en proyectos enterprise: arquitectura, integración y continuidad operativa. 28 años de trayectoria.",
    url: "/proyectos",
    type: "website",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "COP’S Electronics | Proyectos" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Proyectos",
    description:
      "Proyectos enterprise para banca nacional e infraestructura crítica. 28 años de trayectoria.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
