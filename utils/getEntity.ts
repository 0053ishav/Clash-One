import { ENTITY_MAP } from "@/data/entityMap"

export function getEntity(dataId: number) {
  return ENTITY_MAP[dataId] ?? {
    name: "Unknown",
    type: "unknown"
  }
}