import { handle } from "@/lib/api-handler";
import { createStrategy } from "@/lib/models/strategies";

export const POST = handle(async (request, { userId }) => {
  const { label } = await request.json();
  return createStrategy(userId, label);
});
