import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Nosotros", description: "COP'S Electronics, S.A.: 28 años de trayectoria ininterrumpida en automatización, seguridad electrónica y energía. +1500 obras ejecutadas.", openGraph: { title: "COP'S Electronics | Nosotros", description: "28 años de trayectoria ininterrumpida.", url: "/nosotros", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP'S Electronics | Nosotros" }] }, twitter: { card: "summary_large_image", title: "COP'S Electronics | Nosotros", description: "28 años de trayectoria.", images: ["/og.png"] } };
export default function Layout({ children }: { children: ReactNode }) { return <>{children}</>; }
