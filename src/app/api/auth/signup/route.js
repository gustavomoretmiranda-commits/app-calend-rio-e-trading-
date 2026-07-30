import { NextResponse } from "next/server";
import { createUser } from "@/lib/models/users";
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

  let user;
  try {
    user = await createUser(username, password);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const token = await createSessionToken(user.id, user.username);
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
