import type { ResolvedProgression } from "../models";

export function calculateRemainingCost(
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
      data.levels[level]?.cost ?? 0;
  }

  return total;
}