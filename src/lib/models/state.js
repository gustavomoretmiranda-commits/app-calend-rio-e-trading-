import { listTags, listDayTags } from "@/lib/models/tags";
import { listEvents } from "@/lib/models/events";
import { listWeekly } from "@/lib/models/weekly";
import { listAccounts } from "@/lib/models/accounts";
import { listEntries, listTradeItems } from "@/lib/models/entries";
import { listStrategies } from "@/lib/models/strategies";

export function getFullState() {
  return {
    tagConfig: listTags(),
    dayTags: listDayTags(),
    events: listEvents(),
    weekly: listWeekly(),
    accounts: listAccounts(),
    entries: listEntries(),
    tradeItems: listTradeItems(),
    strategies: listStrategies(),
  };
}
