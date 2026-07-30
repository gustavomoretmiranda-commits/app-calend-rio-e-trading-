import { handle } from "@/lib/api-handler";
import { createTradeItem } from "@/lib/models/entries";

export const POST = handle(async (request, { userId }) => {
  const { accountId, date, value, note, strategyId, size, time } = await request.json();
  return createTradeItem(userId, accountId, date, value, note, strategyId, size, time);
});
