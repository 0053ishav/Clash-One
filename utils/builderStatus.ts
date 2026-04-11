import { Upgrade } from "@/types/upgrade";

export function getBuilderStatus(params: {
  normalBuilderCount: number;
  goblinBuilderUnlocked: boolean;
  activeUpgrades: Upgrade[];
}) {
  const normalBusy = params.activeUpgrades.filter(
    (u) => u.builderSlot !== "G"
  ).length;

  const goblinBusy = params.activeUpgrades.some(
    (u) => u.builderSlot === "G"
  );

  const maxNormal = params.normalBuilderCount;
  const maxTotal =
    maxNormal + (params.goblinBuilderUnlocked ? 1 : 0);

  const busyBuilders = normalBusy + (goblinBusy ? 1 : 0);

  const freeNormal = Math.max(maxNormal - normalBusy, 0);
  const freeGoblin =
    params.goblinBuilderUnlocked && !goblinBusy ? 1 : 0;

  const freeBuilders = freeNormal + freeGoblin;

  return {
    maxBuilders: maxTotal,
    busyBuilders,
    freeBuilders,
    freeNormal,
    freeGoblin,
    goblinBusy,
    allFree: busyBuilders === 0,
  };
}
