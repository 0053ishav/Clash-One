import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";

/**
 * Save last successful JSON sync time (epoch ms)
 */
export function setLastJsonSync(timestamp: number) {
  try {
    storage.set(STORAGE_KEYS.LAST_JSON_SYNC, timestamp);
  } catch (error) {
    console.warn("Failed to save last JSON sync", error);
  }
}

/**
 * Get last successful JSON sync time
 */
export function getLastJsonSync(): number | null {
  try {
    const value = storage.getNumber(STORAGE_KEYS.LAST_JSON_SYNC);
    return typeof value === "number" ? value : null;
  } catch (error) {
    console.warn("Failed to read last JSON sync", error);
    return null;
  }
}

/**
 * Clear last sync (optional for testing)
 */
export function resetLastJsonSync() {
  try {
    storage.remove(STORAGE_KEYS.LAST_JSON_SYNC);
  } catch (error) {
    console.warn("Failed to reset last JSON sync", error);
  }
}