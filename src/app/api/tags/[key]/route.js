import { handle } from "@/lib/api-handler";
import { toggleTagHighlight, deleteTag } from "@/lib/models/tags";

export const PATCH = handle(async (_request, { params, userId }) => {
  const { key } = await params;
  return toggleTagHighlight(userId, key);
});

export const DELETE = handle(async (_request, { params, userId }) => {
  const { key } = await params;
  deleteTag(userId, key);
  return { ok: true };
});
