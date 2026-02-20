import { NextResponse } from "next/server";
import { DEMO_SESSION_COOKIE, isLocalMode } from "@/lib/local-mode";
import { verifyTicketsBridgeToken } from "@/lib/platform-bridge";

const WEB_APP_URL = (process.env.WEB_URL || "https://cops-platform-web.vercel.app").replace(/\/$/, "");

function redirectToWebPanel() {
  return NextResponse.redirect(`${WEB_APP_URL}/panel`);
}

function redirectToWebLogin() {
  return NextResponse.redirect(`${WEB_APP_URL}/login`);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token")?.trim();

  if (!token) {
    return redirectToWebPanel();
  }

  const verification = verifyTicketsBridgeToken(token);
  if (!verification.valid) {
    return redirectToWebPanel();
  }

  if (!isLocalMode()) {
    return redirectToWebLogin();
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(DEMO_SESSION_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
