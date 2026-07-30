import { handle } from "@/lib/api-handler";
import { createEvent } from "@/lib/models/events";

export const POST = handle(async (request, { userId }) => {
  const { date, time, label } = await request.json();
  return createEvent(userId, date, time, label);
});
