import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode";
import { verifyTicketsBridgeToken } from "@/lib/platform-bridge";

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "");

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim();
  const localMode = isLocalMode();

  // Sin token → regresar al panel web
  if (!token) {
    return NextResponse.redirect(WEB_APP_URL + "/panel");
  }

  // Verificar token solo en modo producción con Supabase
  if (!localMode) {
    const verification = verifyTicketsBridgeToken(token);
    if (!verification.valid) {
      return NextResponse.redirect(WEB_APP_URL + "/panel");
    }
  }

  // Token aceptado → setear cookie y redirigir al dashboard
  const dashboardUrl = new URL("/dashboard", requestUrl.origin);
  const response = NextResponse.redirect(dashboardUrl.toString());
  response.cookies.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
