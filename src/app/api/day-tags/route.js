import { handle } from "@/lib/api-handler";
import { setDayTag } from "@/lib/models/tags";

export const POST = handle(async (request) => {
  const { date, tagKey, active } = await request.json();
  if (!date || !tagKey) throw new Error("date e tagKey são obrigatórios");
  setDayTag(date, tagKey, !!active);
  return { ok: true };
});
