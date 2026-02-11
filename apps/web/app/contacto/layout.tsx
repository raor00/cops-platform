import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Contacto", description: "Contáctanos para reuniones técnicas y propuestas enterprise. 28 años de trayectoria en automatización, seguridad electrónica y energía.", openGraph: { title: "COP'S Electronics | Contacto", description: "Agendar reunión técnica y solicitar propuesta.", url: "/contacto", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP'S Electronics | Contacto" }] }, twitter: { card: "summary_large_image", title: "COP'S Electronics | Contacto", description: "Reuniones técnicas y propuestas enterprise.", images: ["/og.png"] } };
export default function Layout({ children }: { children: ReactNode }) { return <>{children}</>; }
