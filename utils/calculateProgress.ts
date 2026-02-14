export function calculateProgress(
  startTime: number,
  endTime: number
): number {
  const now = Date.now();

  if (now <= startTime) return 0;
  if (now >= endTime) return 1;

  return (now - startTime) / (endTime - startTime);
}
