import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode";
import { verifyTicketsBridgeToken } from "@/lib/platform-bridge";

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "");

function redirectToWebPanel() {
  return NextResponse.redirect(WEB_APP_URL + "/panel");
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim();
  const localMode = isLocalMode();

  if (!token) {
    return redirectToWebPanel();
  }

  // En modo local se acepta cualquier token que venga del web app
  // En producción con Supabase se verificaría la firma
  if (!localMode) {
    const verification = verifyTicketsBridgeToken(token);
    if (!verification.valid) {
      console.error("[bridge] Token invalido:", verification.reason);
      return redirectToWebPanel();
    }
  }

  // Token aceptado -> página HTML que setea cookie y redirige al dashboard
  // Se usa HTML+JS porque Set-Cookie en redirects cross-site puede ser bloqueado
  // por el browser. Con JS corriendo en el mismo dominio no hay restricciones.
  const cookieMaxAge = 60 * 60 * 12;
  const cookieName = DEMO_SESSION_COOKIE;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="2;url=/dashboard">
  <title>Iniciando sesion...</title>
  <style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0a1628;color:white;font-family:sans-serif}</style>
</head>
<body>
  <p>Iniciando sesion...</p>
  <script>
    try {
      var exp = new Date();
      exp.setTime(exp.getTime() + ${cookieMaxAge} * 1000);
      document.cookie = "${cookieName}=1; path=/; expires=" + exp.toUTCString() + "; SameSite=Lax; Secure";
    } catch(e) {}
    window.location.replace("/dashboard");
  </script>
</body>
</html>`;

  const res = new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
  // También setear via Set-Cookie como respaldo
  res.headers.append(
    "Set-Cookie",
    `${cookieName}=1; Path=/; Max-Age=${cookieMaxAge}; SameSite=Lax; Secure; HttpOnly`
  );
  return res;
}