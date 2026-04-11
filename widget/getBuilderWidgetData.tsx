import { getEntityTypeByDataId } from "@/data/entityMap";
import {
  getActiveUpgrades
} from "@/services/upgradeService";
import { useAccountStore } from "@/stores/accountStore";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";
import { isWorkForHireActive } from "@/utils/goblin";

export async function getBuilderWidgetData(inputTag?: string) {
  const { activeTag, widgetPrefs, accounts, lastJsonSyncMap } =
    useAccountStore.getState();

  const tag = inputTag ?? widgetPrefs.selectedAccountTag ?? activeTag;

  if (!tag) {
    return {
      title: "Builders",
      subtitle: "No account selected",
      progress: 0,
      showProgress: false,
      builderCountText: "Tap to setup",
    };
  }

  const updatedAt = lastJsonSyncMap[tag] ?? null;

  const account = accounts.find((a) => a.tag === tag);

  if (!account) {
    return {
      title: "Builders",
      subtitle: "Open app to sync",
      progress: 0,
      showProgress: false,
      builderCountText: "No account",
    };
  }

  const activeUpgrades = await getActiveUpgrades(tag);

  const builderCount = account.builderCount;
  const goblinBuilder = isWorkForHireActive();

  const status = getBuilderStatus({
    normalBuilderCount: builderCount,
    goblinBuilderUnlocked: goblinBuilder,
    activeUpgrades,
  });

  // Free state
  if (!activeUpgrades?.length || status.allFree) {
    return {
      title: "Builders",
      subtitle: "All builders free",
      progress: 0,
      showProgress: false,
      builderCountText: `${status.freeBuilders} / ${status.maxBuilders} free`,
      color: account.color,
      accountInitials: account.name.slice(0, 2).toUpperCase(),
      updatedAt,
    };
  }

  const sorted = [...activeUpgrades].sort((a, b) => a.endTime - b.endTime);

  const currenUpgrade = sorted[0];
  const nextUpgrade = sorted[1];

  const type = getEntityTypeByDataId(currenUpgrade.dataId);

  const remainingMs = Math.max(currenUpgrade.endTime - Date.now(), 0);
  const totalMs = currenUpgrade.endTime - currenUpgrade.startTime;

  const progress =
    totalMs > 0
      ? calculateProgress(currenUpgrade.startTime, currenUpgrade.endTime)
      : 0;

  const builderLabel =
    currenUpgrade.builderSlot === "G"
      ? "Goblin"
      : typeof currenUpgrade.builderSlot === "number"
        ? `B${currenUpgrade.builderSlot + 1}`
        : "?";

  return {
    title: `${builderLabel} - ${formatBuildingName(currenUpgrade.entity)}`,
    subtitle: formatCountdown(remainingMs),
    progress,
    showProgress: !status.allFree,
    levelText:
      currenUpgrade.currentLevel !== undefined &&
      currenUpgrade.nextLevel !== undefined
        ? `Lv ${currenUpgrade.currentLevel} → ${currenUpgrade.nextLevel}`
        : undefined,
    builderCountText: `${status.freeBuilders} / ${status.maxBuilders} free`,
    nextUpgradeText: nextUpgrade
      ? `${formatBuildingName(nextUpgrade.entity)} • ${formatCountdown(nextUpgrade.endTime - Date.now())}`
      : "No next upgrade",
    dataId: currenUpgrade.dataId,
    type,
    color: account.color,
    accountInitials: account.name.slice(0, 2).toUpperCase(),
    remainingMs: remainingMs,
    updatedAt,
  };
}
