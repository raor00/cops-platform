import { NextResponse } from "next/server";
import {
  MASTER_ROLE_COOKIE,
  MASTER_SESSION_COOKIE,
  MASTER_USER_COOKIE,
} from "../../lib/masterAuth";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  const expire = new Date(0);

  response.cookies.set(MASTER_SESSION_COOKIE, "", {
    path: "/",
    expires: expire,
    maxAge: 0,
    sameSite: "lax",
  });
  response.cookies.set(MASTER_ROLE_COOKIE, "", {
    path: "/",
    expires: expire,
    maxAge: 0,
    sameSite: "lax",
  });
  response.cookies.set(MASTER_USER_COOKIE, "", {
    path: "/",
    expires: expire,
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
