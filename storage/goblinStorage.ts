import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";

const KEYS = STORAGE_KEYS.GOBLIN_BANNER_DISMISSED_UNTIL

/**
 * Store banner dismissal timestamp (epoch ms)
 */
export function setGoblinBannerDismissedUntil(timestamp: number): void {
  try {
    storage.set(KEYS, timestamp);
  } catch (error) {
    console.warn("Failed to store goblin banner dismissal", error);
  }
}

/**
 * Retrieve dismissal timestamp
 */
export function getGoblinBannerDismissedUntil(): number | null {
  try {
    const value = storage.getNumber(KEYS);
    return typeof value === "number" ? value : null;
  } catch (error) {
    console.warn("Failed to read goblin banner dismissal", error);
    return null;
  }
}

/**
 * Clear dismissal (useful for testing or event reset)
 */
export function resetGoblinBannerDismissal(): void {
  try {
    storage.remove(KEYS);
  } catch (error) {
    console.warn("Failed to reset goblin banner dismissal", error);
  }
}

/**
 * Check if banner should be visible
 */
export function shouldShowGoblinBanner(eventEndsAt: number): boolean {
  const dismissedUntil = getGoblinBannerDismissedUntil();

  if (!dismissedUntil) return true;

  // If dismissal expired, show again
  if (Date.now() > dismissedUntil) return true;

  // Still dismissed
  return false;
}
