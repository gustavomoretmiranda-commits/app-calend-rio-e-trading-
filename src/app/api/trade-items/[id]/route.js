import { handle } from "@/lib/api-handler";
import { updateTradeItem, deleteTradeItem } from "@/lib/models/entries";

export const PATCH = handle(async (request, { params }) => {
  const { id } = await params;
  const { value, note, strategyId } = await request.json();
  return updateTradeItem(id, value, note, strategyId);
});

export const DELETE = handle(async (_request, { params }) => {
  const { id } = await params;
  deleteTradeItem(id);
  return { ok: true };
});
