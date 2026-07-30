import { handle } from "@/lib/api-handler";
import { deleteEvent } from "@/lib/models/events";

export const DELETE = handle(async (_request, { params }) => {
  const { id } = await params;
  deleteEvent(id);
  return { ok: true };
});
