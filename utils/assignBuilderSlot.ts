import { Upgrade } from "@/types/upgrade";

export function assignBuilderSlot(
    activeUpgrades: Upgrade[],
    maxBuilders: number,
    allowGoblin: boolean
): number | "G" {
    const usedSlots = activeUpgrades
        .filter(u => u.upgradeType === "BUILDER")
        .map((u) => u.builderSlot)
        .filter((s): s is number | "G" => s !== undefined);

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