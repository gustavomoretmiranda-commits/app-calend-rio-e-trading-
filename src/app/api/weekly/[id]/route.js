import { handle } from "@/lib/api-handler";
import { deleteWeeklyBlock } from "@/lib/models/weekly";

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteWeeklyBlock(userId, id);
  return { ok: true };
});
