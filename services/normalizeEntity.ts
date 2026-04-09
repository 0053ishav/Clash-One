import { useCraftedStore } from "@/stores/craftedEventStore";

export function normalizeEntity(entity: any) {
  if (entity.type !== "crafted_defense") return entity;

  const crafted = useCraftedStore.getState().defenses;
  const meta = crafted[entity.dataId];

  if (!meta) return entity;

  return {
    ...entity,
    name: meta.name,
    moduleName: meta.modules?.[entity.moduleId]?.name,
  };
}