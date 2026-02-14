import { getBuilderCount } from "@/storage/builderConfig";
import { getActiveBuilderUpgrades } from "@/storage/builderUpgrades";
import { getBuilderStatus } from "@/utils/builderStatus";
import { calculateProgress } from "@/utils/calculateProgress";
import { formatBuildingName } from "@/utils/formatBuildingName";
import { formatCountdown } from "@/utils/formatCountdown";

export function getBuilderWidgetData() {
  const activeUpgrades = getActiveBuilderUpgrades();
  const builderCount = getBuilderCount();

  const status = getBuilderStatus({
    normalBuilderCount: builderCount,
    goblinBuilderUnlocked: false,
    activeUpgrades,
  });

  // Free state
  if (!activeUpgrades?.length || status.allFree) {
    return {
      title: "Builders",
      subtitle: "All builders free",
      progress: 0,
      showProgress: false,
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
  const showProgress = remainingMs >= 60 * 60 * 1000;

  return {
    title: formatBuildingName(nextUpgrade.name),
    subtitle: formatCountdown(remainingMs),
    progress,
    showProgress,
  };
}
