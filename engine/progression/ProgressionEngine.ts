import type {
  ProgressionResult,
  ResolvedProgression,
} from "./models";

import {
  calculateRemainingCost,
  calculateRemainingTime,
  calculateUpgradeCost,
  calculateUpgradeTime,
} from "./operations";

import {
  getHallRequirement,
} from "./selectors";

export class ProgressionEngine {
  static resolve(
    progression: ResolvedProgression,
  ): ProgressionResult {
    const {
      currentLevel,
      maxLevel,
      next,
    } = progression;

    return {
      currentLevel,

      nextLevel: next?.level,

      maxLevel,

      remainingLevels:
        Math.max(
          maxLevel - currentLevel,
          0,
        ),

      isMaxLevel:
        currentLevel >= maxLevel,

      nextCost:
        calculateUpgradeCost(
          progression,
        ),

      nextUpgradeTime:
        calculateUpgradeTime(
          progression,
        ),

      remainingCost:
        calculateRemainingCost(
          progression,
        ),

      remainingUpgradeTime:
        calculateRemainingTime(
          progression,
        ),

      requiredHallLevel:
        getHallRequirement(
          progression,
        ),
    };
  }
}