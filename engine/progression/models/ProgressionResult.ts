export interface ProgressionResult {
  currentLevel: number;
  nextLevel?: number;
  maxLevel: number;
  remainingLevels: number;
  isMaxLevel: boolean;
  nextCost: number;
  nextUpgradeTime: number;
  remainingCost: number;
  remainingUpgradeTime: number;
  requiredHallLevel?: number;
}