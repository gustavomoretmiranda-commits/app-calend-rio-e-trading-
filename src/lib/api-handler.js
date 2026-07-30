import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";

export function handle(fn) {
  return async (request, context) => {
    try {
      const sessionUser = await getSessionUser(request);
      const result = await fn(request, { ...context, userId: sessionUser?.userId });
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message || "Erro inesperado" }, { status: 400 });
    }
  };
}
