import { handle } from "@/lib/api-handler";
import { createAccount } from "@/lib/models/accounts";

export const POST = handle(async (request, { userId }) => {
  const { name, balance } = await request.json();
  return createAccount(userId, name, balance);
});
