import { useAccountStore } from "@/stores/accountStore";
import { MultiWidgetItem } from "@/types/widgetTypes";
import { getAllWidgetCaches } from "@/utils/widget/widgetCache";

export function getMultiWidgetDataPro(): MultiWidgetItem[] {
  const { accounts } = useAccountStore.getState();
  const tags = accounts.map((a) => a.tag);

  const cachedList = getAllWidgetCaches(tags) as MultiWidgetItem[];

  const valid = cachedList.filter((x) => x.data);

  const sorted = valid.sort((a, b) => {
    const aFree = a.data.subtitle === "All builders free";
    const bFree = b.data.subtitle === "All builders free";

    if (aFree && !bFree) return -1;
    if (!aFree && bFree) return 1;

    return (a.data.remainingMs ?? Infinity) - (b.data.remainingMs ?? Infinity);
  });

  const primary = sorted[0];

  const rest = sorted.slice(1);
  const totalRest = rest.length;

  if (totalRest === 0) return [primary];

  const interval = 5000;
  const slot = Math.floor(Date.now() / interval);

  const index = slot % totalRest;

  const second = rest[index];
  const third = rest[(index + 1) % totalRest];

  return [primary, second, third].filter(Boolean);
}

/**
 * Free builders account must be top priority.
 */
