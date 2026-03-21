import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";

const getKey = (tag: string) => `${STORAGE_KEYS.LAST_JSON_SYNC}_${tag}`;

/**
 * Save last successful JSON sync time (epoch ms)
 */
export function setLastJsonSync(tag: string, timestamp: number) {
    if (!tag || typeof timestamp !== "number") {
    console.warn("Invalid setLastJsonSync:", { tag, timestamp });
    return;
  }
  try {
    storage.set(getKey(tag), timestamp);
  } catch (error) {
    console.warn("Failed to save last JSON sync", error);
  }
}

/**
 * Get last successful JSON sync time
 */
export function getLastJsonSync(tag: string): number | null {
  try {
    const value = storage.getNumber(getKey(tag));
    return typeof value === "number" ? value : null;
  } catch (error) {
    console.warn("Failed to read last JSON sync", error);
    return null;
  }
}

/**
 * Clear last sync (optional for testing)
 */
export function resetLastJsonSync(tag: string) {
  try {
    storage.remove(getKey(tag));
  } catch (error) {
    console.warn("Failed to reset last JSON sync", error);
  }
}