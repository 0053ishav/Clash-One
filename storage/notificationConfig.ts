import { storage } from "@/storage/mmkv";
import { STORAGE_KEYS } from "./keys";


export function getNotificationsEnabled(): boolean {
  const value = storage.getBoolean(STORAGE_KEYS.NOTIFICATION_KEY);
  return value ?? false;
}

export function setNotificationsEnabled(enabled: boolean) {
  storage.set(STORAGE_KEYS.NOTIFICATION_KEY, enabled);
}
