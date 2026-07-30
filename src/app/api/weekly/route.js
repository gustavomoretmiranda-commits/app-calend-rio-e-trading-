import { handle } from "@/lib/api-handler";
import { createWeeklyBlock } from "@/lib/models/weekly";

export const POST = handle(async (request, { userId }) => {
  const { dayKey, period, start, tagKey, date } = await request.json();
  return createWeeklyBlock(userId, dayKey, period, start, tagKey, date);
});
