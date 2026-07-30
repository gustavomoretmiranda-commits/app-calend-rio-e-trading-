import { handle } from "@/lib/api-handler";
import { deleteEvent } from "@/lib/models/events";

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteEvent(userId, id);
  return { ok: true };
});
