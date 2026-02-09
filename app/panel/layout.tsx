import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <main className="mx-auto max-w-6xl px-4 py-16">{children}</main>;
}
