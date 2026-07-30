import { handle } from "@/lib/api-handler";
import { toggleTagHighlight, deleteTag } from "@/lib/models/tags";

export const PATCH = handle(async (_request, { params }) => {
  const { key } = await params;
  return toggleTagHighlight(key);
});

export const DELETE = handle(async (_request, { params }) => {
  const { key } = await params;
  deleteTag(key);
  return { ok: true };
});
