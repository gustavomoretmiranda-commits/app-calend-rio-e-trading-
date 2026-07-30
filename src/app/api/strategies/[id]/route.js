import { handle } from "@/lib/api-handler";
import { deleteStrategy } from "@/lib/models/strategies";

export const DELETE = handle(async (_request, { params }) => {
  const { id } = await params;
  deleteStrategy(id);
  return { ok: true };
});
