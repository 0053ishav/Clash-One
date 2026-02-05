import { BuilderUpgrade } from "@/types/upgrade";
import * as Crypto from "expo-crypto";

export async function createBuilderUpgrade(params: {
  name: string;
  days: number;
  hours: number;
  minutes: number;
  builderType?: "NORMAL" | "GOBLIN";
}): Promise<BuilderUpgrade> {
  const durationMinutes =
    params.days * 24 * 60 +
    params.hours * 60 +
    params.minutes;

  const startTime = Date.now();
  const endTime = startTime + durationMinutes * 60 * 1000;

  const id = await Crypto.randomUUID();

  return {
    id,
    name: params.name,
    startTime,
    durationMinutes,
    endTime,
    builderType: params.builderType ?? "NORMAL",
    isCompleted: false,
  };
}
