import { ENTITY_MAP } from "@/data/entityMap"

export const GAME_ENTITIES = Object.entries(ENTITY_MAP)
  .map(([dataId, entity]) => ({
    dataId: Number(dataId),
    name: entity.name,
    type: entity.type,
    village: entity.village,
  }))
  .filter(e =>
    e.village === "home" &&
    (e.type === "building" ||
      e.type === "trap" ||
      e.type === "hero")
  )
  .sort((a, b) => a.name.localeCompare(b.name))


export const BUILDINGS = GAME_ENTITIES.filter(
  e => e.type === "building"
)

export const HEROES = GAME_ENTITIES.filter(
  e => e.type === "hero"
)

export const TRAPS = GAME_ENTITIES.filter(
  e => e.type === "trap"
)