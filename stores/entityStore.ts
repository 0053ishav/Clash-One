/**
 * Purpose:
    central cache for entity metadata
*/

/**
 * Store:

manifest
buildings
troops
heroes
pets
etc

Use:
zustand
 */

import { create } from "zustand";

import type {
    EntityData,
    EntityManifest,
} from "@/types/entities";

interface EntityStore {
  manifest: EntityManifest | null;

  entitiesById: Record<number, EntityData>;

  setManifest: (
    manifest: EntityManifest,
  ) => void;

  setEntities: (
    entities: EntityData[],
  ) => void;

  getEntity: (
    id: number,
  ) => EntityData | undefined;
}

export const useEntityStore =
  create<EntityStore>((set, get) => ({
    manifest: null,

    entitiesById: {},

    setManifest: (manifest) =>
      set({
        manifest,
      }),

    setEntities: (entities) => {
      const mapped: Record<
        number,
        EntityData
      > = {};

      for (const entity of entities) {
        mapped[entity.id] = entity;
      }

      set((state) => ({
        entitiesById: {
          ...state.entitiesById,
          ...mapped,
        },
      }));
    },

    getEntity: (id) => {
      return get().entitiesById[id];
    },
  }));