/**
 * Planned Upgrade - Strategic planning for future upgrades
 * Separate from active upgrades to allow strategic planning
 */

export type UpgradeCategory = "BUILDER" | "LAB" | "PET";

export interface PlannedUpgrade {
  id: string;
  category: UpgradeCategory;
  name: string; // Building/Troop name
  currentLevel?: number;
  targetLevel?: number;
  notes?: string; // Strategy notes
  priority: number; // 1 = highest priority
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
  order: number; // for manual reordering
}

// UI/Display enhancements
export interface PlannedUpgradeDisplay extends PlannedUpgrade {
  progressPercent: number;
  estimatedTimeToStart?: string;
  categoryIcon: string;
  categoryColor: string;
}

// Storage structure
export interface PlannedUpgradesState {
  builderPlans: PlannedUpgrade[];
  labPlans: PlannedUpgrade[];
  petPlans: PlannedUpgrade[];
}

// Premium limits
export interface PremiumLimits {
  maxPlannedUpgrades: number; // 3 for free, unlimited for premium
  allowDragReorder: boolean;
  allowNotes: boolean;
  allowExport: boolean;
  categoryGrouping: boolean;
}