import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Soluciones", description: "Automatización, seguridad electrónica y energía para entornos enterprise.", openGraph: { title: "COP'S Electronics | Soluciones", description: "Soluciones enterprise.", url: "/soluciones", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP'S Electronics | Soluciones" }] }, twitter: { card: "summary_large_image", title: "COP'S Electronics | Soluciones", description: "Automatización, seguridad y energía.", images: ["/og.png"] } };
export default function Layout({ children }: { children: ReactNode }) { return <>{children}</>; }
