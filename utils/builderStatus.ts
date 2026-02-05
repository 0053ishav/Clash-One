import { BuilderUpgrade } from "../types/upgrade";

export function getBuilderStatus(params: {
  normalBuilderCount: number;
  goblinBuilderUnlocked: boolean;
  activeUpgrades: BuilderUpgrade[];
}) {
  const maxBuilders =
    params.normalBuilderCount +
    (params.goblinBuilderUnlocked ? 1 : 0);

  const busyBuilders = params.activeUpgrades.length;
  const freeBuilders = Math.max(maxBuilders - busyBuilders, 0);

  return {
    maxBuilders,
    busyBuilders,
    freeBuilders,
    allFree: busyBuilders === 0,
  };
}
