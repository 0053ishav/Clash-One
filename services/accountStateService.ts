// import { getEntities } from "./entityService";
// import { getUpgrades } from "./upgradeService";

// export async function getAccountState(tag: string) {
//   const upgrades = await getUpgrades(tag);
//   const entities = await getEntities(tag);

//   const now = Date.now();

//   const activeUpgrades = upgrades.filter(
//     (u) => !u.isCompleted && u.endTime > now
//   );

//   const labUpgrades = activeUpgrades.filter(
//     (u) => u.upgradeType === "LAB"
//   );

//   const petUpgrade = activeUpgrades.find(
//     (u) => u.upgradeType === "PET"
//   );

//   return {
//     upgrades,
//     activeUpgrades,

//     builders: activeUpgrades.filter(
//       (u) => u.upgradeType === "BUILDER" && u.builderSlot !== undefined
//     ),

//     lab: {
//       normal: labUpgrades.find((u) => u.labSlot === "NORMAL"),
//       goblin: labUpgrades.find((u) => u.labSlot === "GOBLIN"),
//     },

//     pet: petUpgrade ?? null,

//     guardians: activeUpgrades.filter((u) => u.type === "GUARDIAN"),

//     entities,
//     helpers: entities.filter((e) => e.type === "helper"),
//     petsState: entities.filter((e) => e.type === "pet"),
//     guardiansState: entities.filter((e) => e.type === "guardian"),
//   };
// }

import { isWorkForHireActive } from "@/utils/goblin";
import { getEntities } from "./entityService";
import { getUpgrades } from "./upgradeService";

export async function getAccountState(tag: string) {
  const upgrades = await getUpgrades(tag);
  const entities = await getEntities(tag);

  const now = Date.now();

  const activeUpgrades = upgrades.filter(
    (u) => !u.isCompleted && u.endTime > now
  );

  const labUpgrades = activeUpgrades.filter(
    (u) => u.upgradeType === "LAB"
  );

  const petUpgrade = activeUpgrades.find(
    (u) => u.upgradeType === "PET"
  );

  const goblinEventActive = isWorkForHireActive();

  const labNormal = labUpgrades.find((u) => u.labSlot === "NORMAL");
  const labGoblinRaw = labUpgrades.find((u) => u.labSlot === "GOBLIN");

  const labGoblin = goblinEventActive ? labGoblinRaw : null;

  if (!goblinEventActive && labGoblinRaw) {
    console.warn("⚠️ Stale goblin lab upgrade detected (event inactive)");
  }

  return {
    upgrades,
    activeUpgrades,

    builders: activeUpgrades.filter(
      (u) => u.upgradeType === "BUILDER" && u.builderSlot !== undefined
    ),

    lab: {
      normal: labNormal ?? null,
      goblin: labGoblin ?? null,
      goblinAvailable: goblinEventActive,
    },

    pet: petUpgrade ?? null,

    guardians: activeUpgrades.filter((u) => u.type === "GUARDIAN"),

    entities,
    helpers: entities.filter((e) => e.type === "helper"),
    petsState: entities.filter((e) => e.type === "pet"),
    guardiansState: entities.filter((e) => e.type === "guardian"),
  };
}