import { handle } from "@/lib/api-handler";
import { deleteAccount, updateAccountBalance } from "@/lib/models/accounts";

export const PATCH = handle(async (request, { params }) => {
  const { id } = await params;
  const { balance } = await request.json();
  return updateAccountBalance(id, balance);
});

export const DELETE = handle(async (_request, { params }) => {
  const { id } = await params;
  deleteAccount(id);
  return { ok: true };
});
