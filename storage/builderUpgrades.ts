import { STORAGE_KEYS } from "@/storage/keys";
import { storage } from "@/storage/mmkv";
import { BuilderUpgrade } from "@/types/upgrade";


export function getBuilderUpgrades(): BuilderUpgrade[] {
  const raw = storage.getString(STORAGE_KEYS.BUILDER_UPGRADES);
  return raw ? JSON.parse(raw) : [];
}

export function saveBuilderUpgrades(upgrades: BuilderUpgrade[]) {
  storage.set(
    STORAGE_KEYS.BUILDER_UPGRADES,
    JSON.stringify(upgrades)
  );
}

export function addBuilderUpgrade(upgrade: BuilderUpgrade) {
  const current = getBuilderUpgrades();
  saveBuilderUpgrades([...current, upgrade]);
}

export function getActiveBuilderUpgrades(): BuilderUpgrade[] {
  return getBuilderUpgrades().filter(
    (u) => !u.isCompleted && Date.now() < u.endTime
  );
}
