import {
  buildingIcons,
  guardianIcons,
  helperIcons,
  heroIcons,
  petIcons,
  siegeIcons,
  spellIcons,
  townhallIcons,
  trapIcons,
  troopIcons
} from "@/entities/icons";

import type { EntityType } from "@/types/entity";
import { getEntityIcon } from "./getEntityIcon";

export function getIconByEntityType(
  dataId: number,
  type: EntityType,
  fallback?: string
) {
  const iconMaps: Record<EntityType, Record<number, number>> = {
    troop: troopIcons,
    hero: heroIcons,
    pet: petIcons,
    spell: spellIcons,
    siege: siegeIcons,
    townhall: townhallIcons,
    helper: helperIcons,
    guardian: guardianIcons,
    building: buildingIcons,
    trap: trapIcons,
  };

  const map = iconMaps[type];

  if (!map) {
    return require("@/assets/images/builder/builder-complete.png");
  }
  const icon = getEntityIcon(dataId, map, fallback);

  if (!icon) {
    return require("@/assets/images/builder/builder-working.png");
  }

  return icon;
}