import { storage } from "@/storage/mmkv";
import { STORAGE_KEYS } from "./keys";

export function isOnboardingComplete(): boolean {
  return storage.getBoolean(STORAGE_KEYS.ONBOARDING_KEY) ?? false;
}

export function setOnboardingComplete() {
  storage.set(STORAGE_KEYS.ONBOARDING_KEY, true);
}


export function setOnboardingIncomplete() {
  storage.set("ONBOARDING_COMPLETE", "false");
}
