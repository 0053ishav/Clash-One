import { GoblinRemoteConfig } from "@/services/remoteConfig/remoteConfigService";
import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";

const BANNER_KEY = STORAGE_KEYS.GOBLIN_BANNER_DISMISSED_UNTIL
const REMOTECONFIG_KEY = STORAGE_KEYS.REMOTE_CONFIG

/**
 * Store goblin remote config
 */
export function saveRemoteConfigToStorage(
  config: GoblinRemoteConfig
) {
  try {
    storage.set(REMOTECONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn("Failed to cache remote config", e);
  }
}

export function loadRemoteConfigFromStorage(): GoblinRemoteConfig | null {
  try {
    const raw = storage.getString(REMOTECONFIG_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Store banner dismissal timestamp (epoch ms)
 */
export function setGoblinBannerDismissedUntil(timestamp: number): void {
  try {
    storage.set(BANNER_KEY, timestamp);
  } catch (error) {
    console.warn("Failed to store goblin banner dismissal", error);
  }
}

/**
 * Retrieve dismissal timestamp
 */
export function getGoblinBannerDismissedUntil(): number | null {
  try {
    const value = storage.getNumber(BANNER_KEY);
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
    storage.remove(BANNER_KEY);
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