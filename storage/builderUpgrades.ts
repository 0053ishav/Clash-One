import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { BuilderUpgrade } from "@/types/upgrade";
import { autoCompleteBuilderUpgrades } from "@/utils/autoCompleteUpgrades";

export function getBuilderUpgrades (): BuilderUpgrade[] {
  const raw = storage.getString(STORAGE_KEYS.BUILDER_UPGRADES);

  let upgrades: BuilderUpgrade[] = [];

  try {
    upgrades = raw ? JSON.parse(raw) : [];
  } catch {
    upgrades = [];
  }
  
  const normalized = upgrades.map((u) => ({
    ...u,
    currentLevel: u.currentLevel ?? undefined,
    nextLevel: u.nextLevel ?? undefined,
  }));

  const updated = autoCompleteBuilderUpgrades(normalized);

  storage.set(
    STORAGE_KEYS.BUILDER_UPGRADES,
    JSON.stringify(updated)
  );

  return updated;
}

export function getActiveBuilderUpgrades (): BuilderUpgrade[] {
  const now = Date.now();

  return getBuilderUpgrades().filter(
    (u) => !u.isCompleted && u.endTime > now
  );
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

export async function clearAllBuilderUpgrades () {
  storage.remove(STORAGE_KEYS.BUILDER_UPGRADES);
}

export function deleteBuilderUpgrade (id: string) {
  const current = getBuilderUpgrades();
  const updated = current.filter((u) => u.id !== id);
  saveBuilderUpgrades(updated);
}
