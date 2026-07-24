import type { ResolvedProgression } from "../models";

export function calculateRemainingTime(
  progression: ResolvedProgression,
): number {
  const {
    currentLevel,
    progression: data,
  } = progression;

  let total = 0;

  for (
    let level = currentLevel + 1;
    level <= data.maxLevel;
    level++
  ) {
    total +=
      data.levels[level]
        ?.upgradeTime ?? 0;
  }

  return total;
}