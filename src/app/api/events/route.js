import { handle } from "@/lib/api-handler";
import { createEvent } from "@/lib/models/events";

export const POST = handle(async (request) => {
  const { date, time, label } = await request.json();
  return createEvent(date, time, label);
});
