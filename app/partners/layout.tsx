import type { Metadata } from "next";
import type { ReactNode } from "react";


export const metadata: Metadata = {
  title: "Partners",
  description:
    "Ecosistema tecnológico con partners internacionales: Milestone, Winsted, Invenzi, Altronix, Automated Logic y Velasea.",
  openGraph: {
    title: "COP’S Electronics | Partners",
    description:
      "Partners internacionales para proyectos enterprise: Milestone, Winsted, Invenzi, Altronix, Automated Logic y Velasea.",
    url: "/partners",
    type: "website",
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "COP’S Electronics | Partners" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "COP’S Electronics | Partners",
    description:
      "Partners internacionales para soluciones enterprise: Milestone, Winsted, Invenzi, Altronix, Automated Logic y Velasea.",
    images: ["/og.png"],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

