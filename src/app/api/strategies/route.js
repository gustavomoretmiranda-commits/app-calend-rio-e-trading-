import { handle } from "@/lib/api-handler";
import { createStrategy } from "@/lib/models/strategies";

export const POST = handle(async (request) => {
  const { label } = await request.json();
  return createStrategy(label);
});
