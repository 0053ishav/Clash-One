import { BuilderUpgrade } from "@/types/upgrade";
import * as Crypto from "expo-crypto";
import { getEntity } from "./getEntity";

export async function createBuilderUpgrade(params: {
  dataId?: number;
  entity: string;
  type?: string;
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

  const entityData = params.dataId ? getEntity(params.dataId) : null;
  return {
    id,
    dataId: params.dataId,
    entity: entityData?.name ?? params.entity ?? "Custom",
    type: params.type,
    startTime,
    durationMinutes,
    endTime,
    builderType: params.builderType ?? "NORMAL",
    isCompleted: false,
    currentLevel: params.currentLevel,
    nextLevel: params.nextLevel,
  };
}