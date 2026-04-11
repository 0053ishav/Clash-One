import { getEntities } from "./entityService";
import { getUpgrades } from "./upgradeService";


export async function getAccountState(tag: string) {
  const upgrades = await getUpgrades(tag);
  const entities = await getEntities(tag);

  const now = Date.now();

  const activeUpgrades = upgrades.filter(
    (u) => !u.isCompleted && u.endTime > now
  );

  return {
    upgrades,
    activeUpgrades,

    builders: activeUpgrades.filter(
      (u) => u.upgradeType === "BUILDER" && u.builderSlot !== undefined
    ),
    lab: activeUpgrades.find((u) => u.upgradeType === "LAB"),
    pets: activeUpgrades.filter((u) => u.upgradeType === "PET"),
    guardians: activeUpgrades.filter((u) => u.type === "GUARDIAN"),

    entities,
    helpers: entities.filter((e) => e.type === "helper"),
    petsState: entities.filter((e) => e.type === "pet"),
    guardiansState: entities.filter((e) => e.type === "guardian"),
  };
}