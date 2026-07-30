import { handle } from "@/lib/api-handler";
import { deleteAccount, updateAccountBalance } from "@/lib/models/accounts";

export const PATCH = handle(async (request, { params, userId }) => {
  const { id } = await params;
  const { balance } = await request.json();
  return updateAccountBalance(userId, id, balance);
});

export const DELETE = handle(async (_request, { params, userId }) => {
  const { id } = await params;
  deleteAccount(userId, id);
  return { ok: true };
});
