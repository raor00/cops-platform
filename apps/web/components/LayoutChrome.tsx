"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "./SiteFooter";
import NewHomeHeader from "./new-home/NewHomeHeader";
import ScrollProgressBar from "./ScrollProgressBar";

export default function LayoutChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const useNewHome = process.env.NEXT_PUBLIC_NEW_HOME !== "0";
  const isNewHomeRoute = useNewHome && pathname === "/";

  return (
    <>
      <NewHomeHeader />
      <ScrollProgressBar />
      <div className={isNewHomeRoute ? "" : "pt-[68px] md:pt-[76px]"}>{children}</div>
      {/* We only render SiteFooter if it's not the new home, or if we want it everywhere we can just render it */}
      {!isNewHomeRoute && <SiteFooter />}
    </>
  );
}

