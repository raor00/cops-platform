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

  const verification = verifyTicketsBridgeToken(token);

  if (!verification.valid && !localMode) {
    console.error("[bridge] Token invalido:", verification.reason);
    return redirectToWebPanel();
  }

  // Token valido (o modo local) -> HTML que setea cookie y redirige
  // Evita problemas de cross-site cookie al venir redirect de otro dominio
  const cookieMaxAge = 60 * 60 * 12;
  const cookieStr = DEMO_SESSION_COOKIE + "=1; path=/; max-age=" + cookieMaxAge + "; SameSite=Lax; Secure";
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Autenticando...</title></head>
<body>
<script>
  document.cookie = "${cookieStr}";
  window.location.replace("/dashboard");
</script>
<p>Redirigiendo...</p>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}