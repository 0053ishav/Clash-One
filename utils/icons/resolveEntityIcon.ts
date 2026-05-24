import { useCraftedStore } from "@/stores/craftedEventStore";

import { useEntityStore } from "@/stores/entityStore";

export const FALLBACK_ICON =
  "https://cdn.clashwidget.online/entities/fallbacks/fallback.png";

interface ResolveEntityIconOptions {
  subType?: string;

  isCrafted?: boolean;

  context?: {
    townHallLevel?: number;
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

  // -----------------------------------
  // Crafted defense special case
  // -----------------------------------

  if (options?.isCrafted) {
    const craftedIcon =
      crafted.defenses[entityId]
        ?.icon;

    if (craftedIcon) {
      return craftedIcon;
    }

    return FALLBACK_ICON;
  }

  // -----------------------------------
  // Entity lookup
  // -----------------------------------

  const entity =
    entities[entityId];

  if (!entity) {
    return FALLBACK_ICON;
  }

  // -----------------------------------
  // TownHall special case
  // -----------------------------------

  if (
    options?.subType ===
      "TOWNHALL" ||
    entity.subType ===
      "TOWNHALL"
  ) {
    const level =
      options?.context
        ?.townHallLevel;

    if (
      level &&
      entity.levels?.[
        String(level)
      ]
    ) {
      return (
        entity.levels[
          String(level)
        ].icon
      );
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