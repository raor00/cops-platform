import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Proyectos", description: "Casos tipo y experiencia en proyectos enterprise.", openGraph: { title: "COP'S Electronics | Proyectos", description: "Proyectos enterprise.", url: "/proyectos", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP'S Electronics | Proyectos" }] }, twitter: { card: "summary_large_image", title: "COP'S Electronics | Proyectos", description: "Proyectos enterprise.", images: ["/og.png"] } };
export default function Layout({ children }: { children: ReactNode }) { return <>{children}</>; }
