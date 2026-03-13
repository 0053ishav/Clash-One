export type UpgradeType = "BUILDER" | "LAB";

export type BuilderUpgrade = {
  id: string;
  dataId?: number;
  entity: string;
  type?: string;
  
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
