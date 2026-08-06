import { handle } from "@/lib/api-handler";
import { moveWeeklyOccurrence } from "@/lib/models/weekly";

export const POST = handle(async (request, { params, userId }) => {
  const { id } = await params;
  const { fromDate, dayKey, period, start, date } = await request.json();
  return moveWeeklyOccurrence(userId, id, fromDate, { dayKey, period, start, date });
});
