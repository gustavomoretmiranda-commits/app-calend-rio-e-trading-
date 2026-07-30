import { handle } from "@/lib/api-handler";
import { updateTradeItem, deleteTradeItem } from "@/lib/models/entries";

export const PATCH = handle(async (request, { params, userId }) => {
  const { id } = await params;
  const { value, note, strategyId, size, time } = await request.json();
  return updateTradeItem(userId, id, value, note, strategyId, size, time);
});

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteTradeItem(userId, id);
  return { ok: true };
});
