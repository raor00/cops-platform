import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode";
import { verifyTicketsBridgeToken } from "@/lib/platform-bridge";

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "");

function redirectToWebPanel() {
  return NextResponse.redirect(`${WEB_APP_URL}/panel`);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim();
  const localMode = isLocalMode();

  // Sin token → volver al panel web
  if (!token) {
    return redirectToWebPanel();
  }

  const verification = verifyTicketsBridgeToken(token);

  // Token inválido en producción → volver al panel web
  if (!verification.valid && !localMode) {
    console.error("[bridge] Token inválido:", verification.reason);
    return redirectToWebPanel();
  }

  // Token válido (o modo local) → establecer cookie y redirigir al dashboard
  // Usar requestUrl.origin para que el redirect sea siempre al mismo dominio
  const dashboardUrl = new URL("/dashboard", requestUrl.origin);
  const response = NextResponse.redirect(dashboardUrl.toString());

  response.cookies.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true, // siempre true — Vercel siempre es HTTPS
    path: "/",
    maxAge: 60 * 60 * 12, // 12 horas
  });

  return response;
}
