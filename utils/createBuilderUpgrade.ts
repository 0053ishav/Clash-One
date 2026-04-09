import { useCraftedStore } from "@/stores/craftedEventStore";
import { EntityType } from "@/types/entity";
import { BuilderUpgrade } from "@/types/upgrade";
import * as Crypto from "expo-crypto";
import { getEntity } from "./getEntity";

export async function createBuilderUpgrade(params: {
  dataId?: number;
  entity: string;
  type?: EntityType;
  days: number;
  hours: number;
  minutes: number;
  builderType?: "NORMAL" | "GOBLIN";
  currentLevel?: number
  nextLevel?: number
}): Promise<Omit<BuilderUpgrade, "builderSlot">> {
  const durationMinutes =
    params.days * 24 * 60 +
    params.hours * 60 +
    params.minutes;

  const startTime = Date.now();
  const endTime = startTime + durationMinutes * 60 * 1000;

  const id = Crypto.randomUUID();
  const crafted = useCraftedStore.getState();

  const isCrafted = params.dataId
    ? !!crafted.defenses[params.dataId]
    : false;

  const entityData = params.dataId ? getEntity(params.dataId) : null;

  let name = entityData?.name ?? params.entity ?? "Custom";

  if (isCrafted && params.dataId) {
    name = crafted.defenses[params.dataId]?.name ?? name;
  }

  return {
    id,
    dataId: params.dataId,
    entity: name,
    type: params.type ?? entityData?.type,

    startTime,
    durationMinutes,
    endTime,

    builderType: params.builderType ?? "NORMAL",
    isCompleted: false,
    
    currentLevel: params.currentLevel,
    nextLevel: params.nextLevel,

    isCrafted,
  };
}