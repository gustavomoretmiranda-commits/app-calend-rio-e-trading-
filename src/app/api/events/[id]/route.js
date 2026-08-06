import { handle } from "@/lib/api-handler";
import { updateEvent, deleteEvent } from "@/lib/models/events";

export const PATCH = handle(async (request, { params, userId }) => {
  const { id } = await params;
  const { date, time, label } = await request.json();
  return updateEvent(userId, id, { date, time, label });
});

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteEvent(userId, id);
  return { ok: true };
});
