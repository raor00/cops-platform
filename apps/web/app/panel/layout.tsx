import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <main className="w-full min-h-screen">{children}</main>;
}
