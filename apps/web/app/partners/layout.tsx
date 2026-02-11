import type { Metadata } from "next";
import type { ReactNode } from "react";
export const metadata: Metadata = { title: "Partners", description: "Ecosistema tecnológico con partners internacionales.", openGraph: { title: "COP'S Electronics | Partners", description: "Partners internacionales.", url: "/partners", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "COP'S Electronics | Partners" }] }, twitter: { card: "summary_large_image", title: "COP'S Electronics | Partners", description: "Partners internacionales.", images: ["/og.png"] } };
export default function Layout({ children }: { children: ReactNode }) { return <>{children}</>; }
