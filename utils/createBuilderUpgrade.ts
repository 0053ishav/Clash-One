import { normalizeEntityType, resolveUpgradeType } from "@/services/jsonImport/jsonImportService";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { EntityType } from "@/types/entity";
import { Upgrade } from "@/types/upgrade";
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
  currentLevel?: number;
  nextLevel?: number;
  accountTag: string;
}): Promise<Omit<Upgrade, "builderSlot">> {
  const durationMinutes =
    params.days * 24 * 60 +
    params.hours * 60 +
    params.minutes;

  const startTime = Date.now();
  const endTime = startTime + durationMinutes * 60 * 1000;

  const id = Crypto.randomUUID();
  const crafted = useCraftedStore.getState();

  const entityData = params.dataId ? getEntity(params.dataId) : null;

  const rawType = params.type ?? entityData?.type;

  const normalizedType = normalizeEntityType(rawType);
  const upgradeType = resolveUpgradeType(rawType);

  let name = entityData?.name ?? params.entity ?? "Custom";


  const isCrafted = params.dataId
    ? !!crafted.defenses[params.dataId]
    : false;

  if (isCrafted && params.dataId) {
    name = crafted.defenses[params.dataId]?.name ?? name;
  }

  return {
    id,
    accountTag: params.accountTag,

    dataId: params.dataId,
    entity: name,
    
    type: normalizedType,
    upgradeType,

    startTime,
    durationMinutes,
    endTime,

    builderType: params.builderType ?? "NORMAL",
    isCompleted: false,

    currentLevel: params.currentLevel,
    nextLevel: params.nextLevel,

    isCrafted,
    source: "MANUAL",
  };
}