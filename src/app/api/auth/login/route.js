import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const { username, password } = body || {};
  if (!username || !password) {
    return NextResponse.json({ error: "Informe usuário e senha" }, { status: 400 });
  }

  let ok = false;
  try {
    ok = await verifyCredentials(username, password);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 });
  }

  const token = await createSessionToken(username);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
