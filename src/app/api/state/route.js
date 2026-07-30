import { handle } from "@/lib/api-handler";
import { getFullState } from "@/lib/models/state";

export const GET = handle(async () => getFullState());
