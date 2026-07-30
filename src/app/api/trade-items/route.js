import { handle } from "@/lib/api-handler";
import { createTradeItem } from "@/lib/models/entries";

export const POST = handle(async (request) => {
  const { accountId, date, value, note, strategyId } = await request.json();
  return createTradeItem(accountId, date, value, note, strategyId);
});
