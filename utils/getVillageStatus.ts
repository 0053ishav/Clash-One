import { Upgrade } from "@/types/upgrade";

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
  const freeBuilders = builderCount - normalBusyBuilders;

  const hasPetHouse = townHall >= 14;
  const petIdle = hasPetHouse && !pet;

  const isNormalBusy = !!labNormal && !labNormal.isCompleted;
  const isGoblinBusy = !!labGoblin && !labGoblin.isCompleted;

  const labIdle = !isNormalBusy || !isGoblinBusy;

  return {
    freeBuilders,
    allBuildersBusy: freeBuilders <= 0,

    petIdle,
    labIdle,

    hasAnyIdle:
      freeBuilders > 0 || petIdle || labIdle,
  };
}