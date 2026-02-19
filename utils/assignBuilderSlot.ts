import { BuilderUpgrade } from "@/types/upgrade";

export function assignBuilderSlot(
    activeUpgrades: BuilderUpgrade[],
    maxBuilders: number,
    allowGoblin: boolean
): number | "G" {
    const usedSlots = activeUpgrades.map(u => u.builderSlot);

    for (let i = 0; i < maxBuilders; i++) {
        if (!usedSlots.includes(i)) {
            return i;
        }
    }

    if (allowGoblin && !usedSlots.includes("G")) {
        return "G";
    }

    throw new Error("No free builder slot available.");
}