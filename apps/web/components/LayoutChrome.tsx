"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";
import NewHomeHeader from "./new-home/NewHomeHeader";
import AppHeader from "./AppHeader";
import ScrollProgressBar from "./ScrollProgressBar";

export default function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const useNewHome = process.env.NEXT_PUBLIC_NEW_HOME !== "0";
  const isNewHomeRoute = useNewHome && pathname === "/";

  const isInternalPortal = pathname.startsWith("/login") || pathname.startsWith("/panel");

  return (
    <>
      {isInternalPortal ? <AppHeader /> : <NewHomeHeader />}
      {!isInternalPortal && <ScrollProgressBar />}

      <div className={isNewHomeRoute ? "" : isInternalPortal ? "pt-[80px]" : "pt-[68px] md:pt-[76px]"}>
        {children}
      </div>

      {/* Remove footer from the portal paths as well as the new home */}
      {!(isNewHomeRoute || isInternalPortal) && <SiteFooter />}
    </>
  );
}

