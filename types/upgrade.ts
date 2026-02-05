export type UpgradeType = "BUILDER" | "LAB";

export type BuilderUpgrade = {
  id: string;
  name: string;
  startTime: number;       // epoch ms
  durationMinutes: number;
  endTime: number;         // epoch ms
  builderType: "NORMAL" | "GOBLIN";
  isCompleted: boolean;
};

export type LabUpgrade = {
  id: string;
  name: string;
  startTime: number;
  durationMinutes: number;
  endTime: number;
  isCompleted: boolean;
};
 