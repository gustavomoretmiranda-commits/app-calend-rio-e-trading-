import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

export async function getSessionUser(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  if (!payload?.sub) return null;
  return { userId: payload.sub, username: payload.username };
}
