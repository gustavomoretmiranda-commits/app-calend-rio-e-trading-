import { NextResponse } from "next/server";

export function handle(fn) {
  return async (request, context) => {
    try {
      const result = await fn(request, context);
      if (result instanceof NextResponse) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: err.message || "Erro inesperado" }, { status: 400 });
    }
  };
}
