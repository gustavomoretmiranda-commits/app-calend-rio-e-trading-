import { handle } from "@/lib/api-handler";
import { deleteWeeklyBlock } from "@/lib/models/weekly";

export const DELETE = handle(async (_request, { params }) => {
  const { id } = await params;
  deleteWeeklyBlock(id);
  return { ok: true };
});
