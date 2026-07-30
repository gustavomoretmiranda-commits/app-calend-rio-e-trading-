import { handle } from "@/lib/api-handler";
import { createTag } from "@/lib/models/tags";

export const POST = handle(async (request, { userId }) => {
  const { label } = await request.json();
  return createTag(userId, label);
});
