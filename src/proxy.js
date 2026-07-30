import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}
