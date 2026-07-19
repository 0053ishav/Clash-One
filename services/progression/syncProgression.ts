import {
  fetchManifest,
  fetchProgressionCategory,
} from "./progression";

import {
  loadProgressionVersion,
  saveProgressionCategory,
  saveProgressionManifest,
  saveProgressionVersion,
} from "@/storage/progressionStorage";


export async function syncProgression() {
  const manifest =
    await fetchManifest();

  const categories = Object.entries(
    manifest.progression,
  ) as [string, number][];

  for (const [
    category,
    remoteVersion,
  ] of categories) {
    const localVersion =
      loadProgressionVersion(
        category,
      );

    if (
      localVersion ===
      remoteVersion
    ) {
      continue;
    }

    try {
      const progression =
        await fetchProgressionCategory(category,);

      saveProgressionCategory(category, progression,);

      saveProgressionVersion(category, remoteVersion,);

      console.log(
        `Synced progression ${category}`,
      );
    } catch (err) {
      console.log(
        `Failed syncing progression ${category}`,
        err,
      );
    }
  }

  saveProgressionManifest({
    version:
      manifest.progressionVersion,

    categories:
      manifest.progression,
  });
}