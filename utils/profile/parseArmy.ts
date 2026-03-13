import { getEntityId } from "@/data/entityMap";
import { PETS, SIEGE_MACHINES, SUPER_TROOPS } from "@/entities/entityGroups";
import { Village } from "@/types/entity";

interface ArmyEntity {
  name: string;
  level: number;
  maxLevel: number;
  village: Village;
}

function attachId(entity: ArmyEntity) {
  const id = getEntityId(entity.name, entity.village);

  if (!id) {
    console.warn("Missing entity mapping: ", entity.name, entity.village);
  }

  return {
    ...entity,
    dataId: id ?? -1,
  };
}

export function parseArmy(data: any) {
  const troops =
    data.troops
      ?.filter(
        (t: any) =>
          t.village === "home" &&
          !PETS.includes(t.name) &&
          !SIEGE_MACHINES.includes(t.name) &&
          !SUPER_TROOPS.includes(t.name),
      )
      .map(attachId)
      .sort((a: any, b: any) => a.name.localeCompare(b.name)) ?? [];

  const pets = data.troops?.filter((t: any) => PETS.includes(t.name)).map(attachId) || [];

  const superTroops =
    data.troops?.filter((t: any) => SUPER_TROOPS.includes(t.name)).map(attachId) || [];

  const siegeMachines =
    data.troops?.filter((t: any) => SIEGE_MACHINES.includes(t.name)).map(attachId) || [];

  const heroes =
    data.heroes?.filter((h: any) => h.village === "home").map(attachId) || [];

  return {
    troops,
    pets,
    superTroops,
    siegeMachines,
    heroes,
  };
}