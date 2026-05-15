import { ENTITY_MAP } from "@/data/entityMap";
import { getPlayerProfile } from "@/storage/playerProfile";
import { useCraftedStore } from "@/stores/craftedEventStore";
import { EntityType, Resource, SubType } from "@/types/entity";

export type GameEntity = {
  dataId: number;
  name: string;
  type: EntityType;
  subType?: SubType;
  village?: string;
  upgradable?: boolean;
  resource?: Resource;
  isCrafted?: boolean;
  moduleId?: number;
  icon?: string;
  durationEnd?: number;
};

type CraftedDefense = {
  name: string;
  icon: string;
  modules: Record<
    number,
    {
      name: string;
      stat: string;
      resource: Resource;
    }
  >;
};

type CraftedState = {
  defenses: Record<number, CraftedDefense>;
  duration?: { start: number; end: number } | null;
};

export function mapCraftedToEntities(
  crafted: CraftedState
): GameEntity[] {
  if (!crafted?.defenses) return [];

  const durationEnd = crafted.duration?.end ?? 0;

  return Object.entries(crafted.defenses).flatMap(
    ([dataId, defense]) =>
      Object.entries(defense.modules).map(([moduleId, mod]) => ({
        dataId: Number(dataId),
        moduleId: Number(moduleId),
        name: `${defense.name} → ${mod.name}`,


        type: "building" as EntityType,
        resource: mod.resource,

        isCrafted: true,
        icon: defense.icon,
        durationEnd,
      }))
  );
}

const BASE_ENTITIES: GameEntity[] = Object.entries(ENTITY_MAP)
  .map(([dataId, entity]) => ({
    dataId: Number(dataId),
    name: entity.name,
    type: entity.type as EntityType,
    subType: entity.subType,
    village: entity.village,
    upgradable: entity.upgradable,
    resource: entity.resource as Resource,
  }))
  .filter(
    (e) =>
      e.village === "home" &&
      e.upgradable !== false &&
      [
        "building",
        "trap",
        "hero",
        "guardian",
        "troop",
        "siege",
        "spell",
        "pet",
      ].includes(e.type)
  )
  .sort((a, b) => a.name.localeCompare(b.name));

export function getGameEntities(): GameEntity[] {
  const crafted = useCraftedStore.getState();

  const isActive = crafted.isActive();
  const thRequirement = crafted.availableForTH ?? 18;

  const profile = getPlayerProfile();
  const playerTH = profile.townHallLevel;

  const craftedEntities = isActive && playerTH === thRequirement
    ? mapCraftedToEntities({
      defenses: crafted.defenses,
      duration: crafted.duration,
    })
    : [];

  return [...BASE_ENTITIES, ...craftedEntities];
}

export function getBuildings() {
  return getGameEntities().filter(
    (e) => e.type === "building" && !e.isCrafted
  );
}

export function getCraftedDefenses() {
  return getGameEntities().filter((e) => e.isCrafted);
}

export function getHeroes() {
  return getGameEntities().filter((e) => e.type === "hero");
}

export function getTraps() {
  return getGameEntities().filter((e) => e.type === "trap");
}