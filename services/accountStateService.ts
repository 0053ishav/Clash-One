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

  const homeBuilders = activeUpgrades.filter(
    (u) =>
      u.upgradeType === "BUILDER" &&
      u.village === "home"
  );

  const builderBaseBuilders = activeUpgrades.filter(
    (u) =>
      u.upgradeType === "BUILDER" &&
      u.village === "builderBase"
  );

  const homeLabs = activeUpgrades.filter(
    (u) =>
      u.upgradeType === "LAB" &&
      u.village === "home"
  );

  const builderBaseLabs = activeUpgrades.filter(
    (u) =>
      u.upgradeType === "LAB" &&
      u.village === "builderBase"
  );

  const petUpgrade = activeUpgrades.find(
    (u) => u.upgradeType === "PET"
  );

  const goblinEventActive = isWorkForHireActive();

  const homeLabNormal = homeLabs.find((u) => u.labSlot === "NORMAL");
  const homeLabGoblinRaw = homeLabs.find((u) => u.labSlot === "GOBLIN");

  const homeLabGoblin = goblinEventActive ? homeLabGoblinRaw : null;

  const builderBaseLab =
    builderBaseLabs.find(
      (u) => u.labSlot === "NORMAL"
    );

  if (!goblinEventActive && homeLabGoblinRaw) {
    console.warn("⚠️ Stale goblin lab upgrade detected (event inactive)");
  }
  return {
    upgrades,
    activeUpgrades,

    builders: {
      home: homeBuilders,
      builderBase: builderBaseBuilders,
    },

    lab: {
      home: {
        normal: homeLabNormal ?? null,
        goblin: homeLabGoblin ?? null,
        goblinAvailable: goblinEventActive,
      },

      builderBase: {
        normal: builderBaseLab ?? null,
      }
    },

    pet: petUpgrade ?? null,

    guardians: activeUpgrades.filter((u) => u.type === "GUARDIAN"),

    entities,
    helpers: entities.filter((e) => e.type === "helper"),
    petsState: entities.filter((e) => e.type === "pet"),
    guardiansState: entities.filter((e) => e.type === "guardian"),
  };
}