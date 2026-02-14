import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";

export function setBuilderCount(count: number) {
  storage.set(STORAGE_KEYS.BUILDER_COUNT, count);
}

export function getBuilderCount(): number {
  const value = storage.getNumber(STORAGE_KEYS.BUILDER_COUNT);
  return value ?? 5; // fallback default
}
