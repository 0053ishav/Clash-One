import { useCraftedStore } from "@/stores/craftedEventStore";

import { useEntityStore } from "@/stores/entityStore";

export const FALLBACK_ICON =
  "https://cdn.clashwidget.online/entities/fallbacks/fallback.png";

const HALL_TYPES = [
  "TOWNHALL",
  "BUILDERHALL",
] as const;

interface ResolveEntityIconOptions {
  subType?: string;

  isCrafted?: boolean;

  context?: {
    hallLevel?: number;
  };
}

export function resolveEntityIcon(
  entityId: number,
  options?: ResolveEntityIconOptions,
) {
  const entities =
    useEntityStore.getState()
      .entitiesById;

  const crafted =
    useCraftedStore.getState();

  /**
   * Crafted defense special case
   */

  if (options?.isCrafted) {
    const craftedIcon =
      crafted.defenses[entityId]
        ?.icon;

    if (craftedIcon) {
      return craftedIcon;
    }

    return FALLBACK_ICON;
  }

  /**
   * Entity Lookup
   */

  const entity =
    entities[entityId];

  if (!entity) {
    return FALLBACK_ICON;
  }

  /**
   * -----------------------------------
   * Town Hall / Builder Hall
   * level-specific icon
   * -----------------------------------
   */

  const subType =
    options?.subType ??
    entity.subType ??
    "";

  if (
    HALL_TYPES.includes(
      subType as (typeof HALL_TYPES)[number],
    )
  ) {
    const level =
      options?.context
        ?.hallLevel;

    if (level) {
      const levelIcon = entity.levels?.[String(level)]?.icon;

      if (levelIcon) {
        return levelIcon;
      }
    }
  }

  // -----------------------------------
  // Default icon
  // -----------------------------------
  return (
    entity.icon ??
    FALLBACK_ICON
  );
}