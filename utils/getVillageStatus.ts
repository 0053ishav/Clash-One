import { Upgrade } from "@/types/upgrade";
import { isWorkForHireActive } from "./goblin";

export function getVillageStatus({
  townHall,
  builders,
  builderCount,
  pet,
  labNormal,
  labGoblin,
}: {
  townHall: number,
  builders: Upgrade[];
  builderCount: number;
  pet?: Upgrade | null;
  labNormal?: Upgrade | null;
  labGoblin?: Upgrade | null;
}) {
  const normalBusyBuilders = builders.filter(
    (b) => b.builderSlot !== "G"
  ).length;

  const goblinBuilderBusy = builders.some(
    (b) => b.builderSlot === "G"
  );

  const freeBuilders = builderCount - normalBusyBuilders;

  const hasPetHouse = townHall >= 14;
  const petIdle = hasPetHouse && !pet;


  const isNormalLabBusy =
    !!labNormal && !labNormal.isCompleted;

  const isGoblinLabBusy =
    !!labGoblin && !labGoblin.isCompleted;

  const labIdle = !isNormalLabBusy;

  const goblinLabIdle =
    isWorkForHireActive() &&
    !labIdle &&
    !isGoblinLabBusy;

  const goblinBuilderIdle =
    isWorkForHireActive() &&
    freeBuilders <= 0 &&
    !goblinBuilderBusy;

  return {
    freeBuilders,
    allBuildersBusy: freeBuilders <= 0,

    petIdle,

    labIdle,
    goblinLabIdle,

    goblinBuilderIdle,

    hasAnyIdle:
      freeBuilders > 0 ||
      petIdle ||
      labIdle ||
      goblinLabIdle ||
      goblinBuilderIdle,
  };
}