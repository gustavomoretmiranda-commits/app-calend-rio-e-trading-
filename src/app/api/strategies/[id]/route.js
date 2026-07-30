import { handle } from "@/lib/api-handler";
import { deleteStrategy } from "@/lib/models/strategies";

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteStrategy(userId, id);
  return { ok: true };
});
