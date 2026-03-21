import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";


export function setActiveAccount(tag: string) {
  storage.set(STORAGE_KEYS.ACTIVE_KEY, tag);
}

export function getActiveAccount() {
  return storage.getString(STORAGE_KEYS.ACTIVE_KEY);
}