import { useCraftedStore } from "@/stores/craftedEventStore";

export function useCraftedResolver() {
  const defenses = useCraftedStore((s) => s.defenses);
  const isActive = useCraftedStore((s) => s.isActive);

  function getCraftedName(dataId?: number) {
    if (!dataId || !isActive()) return null;
    return defenses[dataId]?.name ?? null;
  }

  function getModuleName(dataId?: number, moduleId?: number) {
    if (!dataId || !moduleId || !isActive()) return null;
    return defenses[dataId]?.modules?.[moduleId]?.name ?? null;
  }

  function getCraftedIcon(dataId?: number) {
    if (!dataId || !isActive()) return null;
    return defenses[dataId]?.icon ?? null;
  }

  return { getCraftedName, getModuleName, getCraftedIcon };
}