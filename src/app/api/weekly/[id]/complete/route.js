import { handle } from "@/lib/api-handler";
import { toggleWeeklyCompletion } from "@/lib/models/weekly";

export const POST = handle(async (request, { params, userId }) => {
  const { id } = await params;
  const { date } = await request.json();
  return toggleWeeklyCompletion(userId, id, date);
});
