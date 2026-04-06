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

  const isLoginPage = pathname.startsWith("/login")
  const isInternalPortal = pathname.startsWith("/panel");

  return (
    <>
      {!isLoginPage && (isInternalPortal ? <AppHeader /> : <NewHomeHeader />)}
      {!isInternalPortal && !isLoginPage && <ScrollProgressBar />}

      <div className={isNewHomeRoute ? "" : isInternalPortal ? "pt-[80px]" : isLoginPage ? "" : "pt-[68px] md:pt-[76px]"}>
        {children}
      </div>

      {!(isNewHomeRoute || isInternalPortal || isLoginPage) && <SiteFooter />}
    </>
  );
}

