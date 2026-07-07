import { storage } from "@/storage/mmkv";

import { useEntityStore } from "@/stores/entityStore";

const CATEGORIES = [
  "buildings",
  "troops",
  "heroes",
  "pets",
  "spells",
  "sieges",
  "traps",
  "helpers",
  "guardians",
  "townhall",
  "halls",
];

export function hydrateEntities() {
  const store =
    useEntityStore.getState();

  for (const category of CATEGORIES) {
    const raw =
      storage.getString(
        `entities_${category}`,
      );

    if (!raw) continue;

    try {
      const parsed =
        JSON.parse(raw);

      store.setEntities(
        parsed,
      );

      // console.log(
      //   `Hydrated ${category}`,
      // );
    } catch (err) {
      console.log(
        `Failed hydrating ${category}`,
      );
    }
  }
}