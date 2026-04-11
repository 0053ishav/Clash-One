import { Upgrade } from "@/types/upgrade";

export function deriveCompletionState(upgrades: Upgrade[]) {
  const now = Date.now();

  return upgrades.map((u) => {
    const isCompleted = !u.isCompleted && now >= u.endTime;

    return {
      ...u,
      isCompleted: isCompleted ? true : u.isCompleted,

      status: isCompleted
        ? "COMPLETED"
        : u.endTime - now < 30 * 60 * 1000
        ? "FINISHING_SOON"
        : "ACTIVE",
    };
  });
}