import { Upgrade } from "@/types/upgrade";

export function getVillageStatus({
  builders,
  builderCount,
  pet,
  lab,
}: {
  builders: Upgrade[];
  builderCount: number;
  pet?: Upgrade;
  lab?: Upgrade;
}) {
  const busyBuilders = builders.length;
  const freeBuilders = builderCount - busyBuilders;

  const petIdle = !pet;
  const labIdle = !lab;

  return {
    freeBuilders,
    allBuildersBusy: freeBuilders <= 0,

    petIdle,
    labIdle,

    hasAnyIdle:
      freeBuilders > 0 || petIdle || labIdle,
  };
}