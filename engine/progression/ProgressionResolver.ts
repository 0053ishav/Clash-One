import type {
  ProgressionLevel as BackendProgressionLevel,
  ProgressionData,
} from "@/types/progression";

import type {
  ProgressionEntity,
  ProgressionLevel,
  ResolvedProgression,
} from "./models";

export class ProgressionResolver {
  static resolve(
    entity: ProgressionEntity,
    progression: ProgressionData,
    currentLevel: number,
  ): ResolvedProgression {
    const current =
      progression.levels[
      currentLevel
      ];

    const next =
      progression.levels[
      currentLevel + 1
      ];

    return {
      entity,
      progression,
      currentLevel,
      current: this.mapLevel(
        currentLevel,
        current,
      ),
      next: this.mapLevel(
        currentLevel + 1,
        next,
      ),
      maxLevel:
        progression.maxLevel,
    };
  }

  private static mapLevel(
    level: number,
    data?: BackendProgressionLevel,
  ): ProgressionLevel | undefined {
    if (!data) return undefined;

    return {
      level,
      ...data,
      requiredHallLevel: data.hallLevel,
      laboratoryLevel:
        data.laboratoryLevel ??
        data.labLevel,
    };
  };

}