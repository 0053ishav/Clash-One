import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { BuilderUpgrade } from "@/types/upgrade";
import { autoCompleteBuilderUpgrades } from "@/utils/autoCompleteUpgrades";

export function getBuilderUpgrades (): BuilderUpgrade[] {
  const raw = storage.getString(STORAGE_KEYS.BUILDER_UPGRADES);
  // const upgrades: BuilderUpgrade[] = raw ? JSON.parse(raw) : [];

  let upgrades: BuilderUpgrade[] = [];

  try {
    upgrades = raw ? JSON.parse(raw) : [];
  } catch {
    upgrades = [];
  }
  
  const updated = autoCompleteBuilderUpgrades(upgrades);

  storage.set(
    STORAGE_KEYS.BUILDER_UPGRADES,
    JSON.stringify(updated)
  );

  return updated;
}

export function saveBuilderUpgrades (upgrades: BuilderUpgrade[]) {
  storage.set(
    STORAGE_KEYS.BUILDER_UPGRADES,
    JSON.stringify(upgrades)
  );
}

export function addBuilderUpgrade (upgrade: BuilderUpgrade) {
  const current = getBuilderUpgrades();
  saveBuilderUpgrades([...current, upgrade]);
}

export function getActiveBuilderUpgrades (): BuilderUpgrade[] {
  return getBuilderUpgrades().filter(
    (u) => !u.isCompleted && Date.now() < u.endTime
  );
}

export async function clearAllBuilderUpgrades () {
  storage.remove(STORAGE_KEYS.BUILDER_UPGRADES);
}

export function deleteBuilderUpgrade (id: string) {
  const current = getBuilderUpgrades();
  const updated = current.filter((u) => u.id !== id);
  saveBuilderUpgrades(updated);
}
