import { handle } from "@/lib/api-handler";
import { createAccount } from "@/lib/models/accounts";

export const POST = handle(async (request) => {
  const { name, balance } = await request.json();
  return createAccount(name, balance);
});
