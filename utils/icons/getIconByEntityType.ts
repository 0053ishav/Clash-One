// import {
//   buildingIcons,
//   craftedIcons,
//   guardianIcons,
//   helperIcons,
//   heroIcons,
//   petIcons,
//   siegeIcons,
//   spellIcons,
//   townhallIcons,
//   trapIcons,
//   troopIcons
// } from "@/entities/icons";

// import { useCraftedStore } from "@/stores/craftedEventStore";
// import type { EntityType } from "@/types/entity";
// import { getEntityIcon } from "./getEntityIcon";

// export function getIconByEntityType(
//   dataId: number,
//   type: EntityType,
//   subType?: string,
//   isCrafted?: boolean,
//   context?: { townHallLevel?: number }
// ) {
//   const crafted = useCraftedStore.getState();

//   if (isCrafted) {
//     const iconUrl = crafted.defenses[dataId]?.icon;
//     if (iconUrl) return iconUrl;

//     return require("@/assets/images/builder/builder-working.png");
//   }

//   let map: Record<number, number> | undefined;
//   let idToUse = dataId;

//   // 🔥 CENTRALIZED SPECIAL LOGIC
//   if (subType === "TOWNHALL") {
//     map = townhallIcons;

//     // use TH level instead of dataId
//     if (context?.townHallLevel) {
//       idToUse = context.townHallLevel;
//     }
//   } else {
//     const iconMaps: Record<EntityType, Record<number, number>> = {
//       troop: troopIcons,
//       hero: heroIcons,
//       pet: petIcons,
//       spell: spellIcons,
//       siege: siegeIcons,
//       townhall: townhallIcons,
//       helper: helperIcons,
//       guardian: guardianIcons,
//       building: buildingIcons,
//       trap: trapIcons,
//       lab: troopIcons,
//       Custom: troopIcons,
//       crafted: craftedIcons,
//     };

//     map = iconMaps[type];
//   }

//   if (!map) {
//     return require("@/assets/images/builder/builder-complete.png");
//   }

//   const icon = getEntityIcon(idToUse, map);

//   if (!icon) {
//     return require("@/assets/images/builder/builder-working.png");
//   }

//   return icon;
// }