import { handle } from "@/lib/api-handler";
import { createWeeklyBlock } from "@/lib/models/weekly";

export const POST = handle(async (request) => {
  const { dayKey, period, start, tagKey, date } = await request.json();
  return createWeeklyBlock(dayKey, period, start, tagKey, date);
});
