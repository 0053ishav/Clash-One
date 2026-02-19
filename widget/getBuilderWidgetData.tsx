import { getActiveBuilderUpgrades } from "@/storage/builderUpgrades";
import { getPlayerProfile } from "@/storage/playerProfile";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";

export function getBuilderWidgetData() {
  const activeUpgrades = getActiveBuilderUpgrades();

  const playerProfile = getPlayerProfile();
  const builderCount = playerProfile.normalBuilderCount;
  const goblinBuilder = playerProfile.goblinBuilder.unlocked;

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
      builderCountText: `${status.freeBuilders} / ${status.maxBuilders} builders free`,
    };
  }

  // Find next finishing upgrade safely
  const nextUpgrade = activeUpgrades.reduce((prev, curr) =>
    prev.endTime < curr.endTime ? prev : curr,
  );

  const remainingMs = Math.max(nextUpgrade.endTime - Date.now(), 0);
  const totalMs = nextUpgrade.endTime - nextUpgrade.startTime;

  const progress =
    totalMs > 0
      ? calculateProgress(nextUpgrade.startTime, nextUpgrade.endTime)
      : 0;

  // Only show progress if upgrade is 1 hour or longer
  // const showProgress = remainingMs >= 60 * 60 * 1000;

  return {
    title: formatBuildingName(nextUpgrade.name),
    subtitle: formatCountdown(remainingMs),
    progress,
    showProgress: !status.allFree,
    levelText:
      nextUpgrade.currentLevel !== undefined &&
      nextUpgrade.nextLevel !== undefined
        ? `Lv ${nextUpgrade.currentLevel} → ${nextUpgrade.nextLevel}`
        : undefined,
  };
}
