export function calculateGoblinCost(durationMinutes: number): number {
  const gemPerMinute = 1 / 36; // 1 gem per 36 minutes
  const rawCost = Math.floor(durationMinutes * gemPerMinute);

  return Math.max(rawCost, 10);
}
