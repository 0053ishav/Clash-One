export function getProgressColor(status: string) {
  if (status === "max") return "#22c55e";
  if (status === "near") return "#fbbf24";
  if (status === "mid") return "#38bdf8";
  return "#ef4444";
}