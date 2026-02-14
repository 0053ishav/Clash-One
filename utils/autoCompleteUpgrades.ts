import { BuilderUpgrade } from "@/types/upgrade";

export function autoCompleteBuilderUpgrades(
  upgrades: BuilderUpgrade[]
): BuilderUpgrade[] {
  const now = Date.now();

  return upgrades.map((u) => {
    if (!u.isCompleted && now >= u.endTime) {
      return { ...u, isCompleted: true };
    }
    return u;
  });
}
