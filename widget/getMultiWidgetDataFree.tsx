import { useAccountStore } from "@/stores/accountStore";
import { MultiWidgetItem } from "@/types/widgetTypes";
import { getAllWidgetCaches } from "@/utils/widget/widgetCache";

export function getMultiWidgetDataFree(): MultiWidgetItem[] {
  const { accounts } = useAccountStore.getState();

  const tags = accounts.map((a) => a.tag);

  const cachedList = getAllWidgetCaches(tags) as MultiWidgetItem[];

  const valid = cachedList.filter((x) => x.data);

  const sorted = valid.sort((a, b) => {
    const aTime = a.data.remainingMs ?? 1;
    const bTime = b.data.remainingMs ?? 1;

    return aTime - bTime;
  });

  // ✅ take top 3
  return sorted.slice(0, 3);
}
