import { ENTITY_MAP } from "@/data/entityMap"

export const GAME_ENTITIES = Object.entries(ENTITY_MAP)
  .map(([dataId, entity]) => ({
    dataId: Number(dataId),
    name: entity.name,
    type: entity.type,
  }))
  .filter(e =>
    e.type === "building" ||
    e.type === "trap" ||
    e.type === "hero"
  )
  .sort((a, b) => a.name.localeCompare(b.name))
  