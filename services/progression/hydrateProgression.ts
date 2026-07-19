

import { useProgressionStore } from "@/stores/progressionStore";

import { loadProgressionCategory, loadProgressionManifest } from "@/storage/progressionStorage";
import type {
  ProgressionData
} from "@/types/progression";
import { log } from "@/utils/logger";

export function hydrateProgression() {
  const manifest = loadProgressionManifest();

  log("Progression Manifest: ", manifest);

  if (!manifest) {
    return;
  }

  const store =
    useProgressionStore.getState();

  const merged: ProgressionData[] = [];

  for (const category of Object.keys(manifest.categories,)) {
    const progression = loadProgressionCategory(category);
    
    if (!progression) continue;

    merged.push(...progression);
  }

  store.setProgression(merged);
  store.setManifest(manifest);
}