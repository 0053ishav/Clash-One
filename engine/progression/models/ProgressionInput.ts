import type {
    ProgressionData,
} from "@/types/progression";

import type {
    ProgressionEntity,
} from "./ProgressionEntity";

export interface ProgressionInput {
  entity: ProgressionEntity;
  progression: ProgressionData;
  currentLevel: number;
}