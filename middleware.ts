import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_SESSION_VALUE,
  canAccessModule,
} from "./lib/masterAuth";

function hasMasterSession(request: NextRequest) {
  return request.cookies.get(MASTER_SESSION_COOKIE)?.value === MASTER_SESSION_VALUE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasMasterSession(request);
  const role = request.cookies.get(MASTER_ROLE_COOKIE)?.value;

  if (pathname.startsWith("/panel") && !loggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && loggedIn) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  if (pathname.startsWith("/panel/soporte") && !canAccessModule(role, "soporte")) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  if (
    pathname.startsWith("/panel/cotizaciones") &&
    !canAccessModule(role, "cotizaciones")
  ) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  if (
    pathname.startsWith("/panel/administracion") &&
    !canAccessModule(role, "administracion")
  ) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  if (pathname.startsWith("/panel/tickets") && !canAccessModule(role, "soporte")) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/panel/:path*"],
};
