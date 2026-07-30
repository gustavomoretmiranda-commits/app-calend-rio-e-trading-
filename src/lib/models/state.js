import { listTags, listDayTags } from "@/lib/models/tags";
import { listEvents } from "@/lib/models/events";
import { listWeekly } from "@/lib/models/weekly";
import { listAccounts } from "@/lib/models/accounts";
import { listEntries, listTradeItems } from "@/lib/models/entries";
import { listStrategies } from "@/lib/models/strategies";

export function getFullState(userId) {
  return {
    tagConfig: listTags(userId),
    dayTags: listDayTags(userId),
    events: listEvents(userId),
    weekly: listWeekly(userId),
    accounts: listAccounts(userId),
    entries: listEntries(userId),
    tradeItems: listTradeItems(userId),
    strategies: listStrategies(userId),
  };
}
