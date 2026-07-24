import { ProgressionData } from "@/types/progression";
import type {
  ProgressionEntity,
  ProgressionLevel,
} from "./index";

export interface ResolvedProgression {
  entity: ProgressionEntity;
  progression: ProgressionData;
  currentLevel: number;
  current?: ProgressionLevel;
  next?: ProgressionLevel;
  maxLevel: number;
}