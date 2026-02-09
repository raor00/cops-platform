import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { MASTER_SESSION_COOKIE, MASTER_SESSION_VALUE } from "./lib/masterAuth";

function hasMasterSession(request: NextRequest) {
  return request.cookies.get(MASTER_SESSION_COOKIE)?.value === MASTER_SESSION_VALUE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasMasterSession(request);

  if (pathname.startsWith("/panel") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && loggedIn) {
    return NextResponse.redirect(new URL("/panel/cotizaciones", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/panel/:path*"],
};
