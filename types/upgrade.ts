import { EntityType } from "./entity";

export type UpgradeType = "BUILDER" | "LAB";

export type BuilderUpgrade = {
  id: string;
  dataId?: number;
  moduleId?: number;
  entity: string;
  isCrafted?: boolean;
  type?: EntityType;
  
  startTime: number;       // epoch ms
  durationMinutes: number;
  endTime: number;         // epoch ms
  
  builderType: "NORMAL" | "GOBLIN";
  builderSlot: number | "G";
  
  isCompleted: boolean;
  source?: "MANUAL" | "JSON";
  
  currentLevel?: number;
  nextLevel?: number;
};

export type LabUpgrade = {
  id: string;
  name: string;
  startTime: number;
  durationMinutes: number;
  endTime: number;
  isCompleted: boolean;
};

export type BuilderWidgetData = {
  title: string;
  subtitle: string;
  progress: number;
  showProgress: boolean;
  levelText?: string;
  builderCountText?: string;
  nextUpgradeText?: string;
  dataId?: number;
  type?: EntityType;
  color?: string;
  accountInitials?: string;
};