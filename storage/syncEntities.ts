import {
  fetchCategory,
  fetchManifest,
} from "@/services/cdnEntities/entities";
import { storage } from "@/storage/mmkv";
import { useEntityStore } from "@/stores/entityStore";
import { STORAGE_KEYS } from "./keys";

export async function syncEntities() {
  const manifest =
    await fetchManifest();

  const categories =
    Object.entries(
      manifest.categories,
    );

  for (const [
    category,
    remoteVersion,
  ] of categories) {
    const versionKey =
      `entities_version_${category}`;

    const dataKey =
      `entities_${category}`;


      console.log("📦 CATEGORY", category);

    const localVersion =
      storage.getNumber(
        versionKey,
      );


    // already latest
    if (
      localVersion ===
      remoteVersion
    ) {
      // console.log(
      //   `${category} already latest`,
      // );

      continue;
    }

    try {
      const entities =
        await fetchCategory(
          category,
        );

      //    console.log(
      //   `${category} fetched`,
      // );

      // save to zustand
      useEntityStore
        .getState()
        .setEntities(
          entities,
        );

      // save raw json
      storage.set(
        dataKey,
        JSON.stringify(
          entities,
        ),
      );

      // save category version
      storage.set(
        versionKey,
        remoteVersion,
      );

      console.log(
        `Synced ${category}`,
      );
    } catch (err) {
      console.log(
        `Failed syncing ${category}`,
        err,
      );
    }
  }

  // save manifest
  useEntityStore
    .getState()
    .setManifest(
      manifest,
    );

  storage.set(
    STORAGE_KEYS.ENTITY_MANIFEST,
    JSON.stringify(
      manifest,
    ),
  );
}