"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const useNewHome = process.env.NEXT_PUBLIC_NEW_HOME !== "0";
  const isNewHomeRoute = useNewHome && pathname === "/";

  if (isNewHomeRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <div className="pt-[68px] md:pt-[76px]">{children}</div>
      <SiteFooter />
    </>
  );
}

