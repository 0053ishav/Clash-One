import { EntityRecord } from "@/types/upgrade";

export function getNextPetSuggestion(pets: EntityRecord[]) {
  if (!pets?.length) return null;

  // simple strategy: lowest level pet first
  console.log("Calculating next pet suggestion from", pets);
  const sorted = [...pets].sort((a, b) => a.level - b.level);

  return sorted[0];
}