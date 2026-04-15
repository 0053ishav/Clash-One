import { getEntityTypeByDataId } from "@/data/entityMap";
import { getAccountState } from "@/services/accountStateService";
import { useAccountStore } from "@/stores/accountStore";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";

export async function getLabWidgetData(inputTag?: string) {
  const { activeTag, widgetPrefs, accounts, lastJsonSyncMap } =
    useAccountStore.getState();

  const tag = inputTag ?? widgetPrefs.selectedAccountTag ?? activeTag;

  if (!tag) {
    return {
      title: "Laboratory",
      subtitle: "No account selected",
      progress: 0,
      showProgress: false,
    };
  }

  const account = accounts.find((a) => a.tag === tag);
  const updatedAt = lastJsonSyncMap[tag] ?? null;

  if (!account) {
    return {
      title: "Laboratory",
      subtitle: "Open app to sync",
      progress: 0,
      showProgress: false,
    };
  }

  // ✅ SINGLE SOURCE OF TRUTH
  const state = await getAccountState(tag);

  const normal = state.lab.normal;
  const goblin = state.lab.goblin;

  // 🟢 IDLE
  if (!normal && !goblin) {
    return {
      title: "Laboratory",
      subtitle: "Idle",
      progress: 0,
      showProgress: false,
      color: account.color,
      accountInitials: account.name.slice(0, 2).toUpperCase(),
      updatedAt,
    };
  }

  // 🎯 PRIORITY: normal > goblin
  const current = normal ?? goblin!;
  const isGoblinOnly = !normal && !!goblin;

  const remainingMs = Math.max(current.endTime - Date.now(), 0);
  const totalMs = current.endTime - current.startTime;

  const progress =
    totalMs > 0
      ? calculateProgress(current.startTime, current.endTime)
      : 0;

  const type = current.dataId
    ? getEntityTypeByDataId(current.dataId)
    : undefined;

  return {
    title: `${isGoblinOnly ? "Goblin Lab" : "Lab"} - ${formatBuildingName(current.entity)}`,
    subtitle: formatCountdown(remainingMs),
    progress,
    showProgress: true,

    levelText:
      current.currentLevel !== undefined &&
      current.nextLevel !== undefined
        ? `Lv ${current.currentLevel} → ${current.nextLevel}`
        : undefined,

    // 👇 show goblin as secondary if both active
    nextUpgradeText:
      normal && goblin
        ? ` Goblin • ${formatCountdown(goblin.endTime - Date.now())}`
        : "No parallel research",

    dataId: current.dataId,
    type,

    color: account.color,
    accountInitials: account.name.slice(0, 2).toUpperCase(),
    updatedAt,
  };
}