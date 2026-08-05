export function formatNumber(value: number): string {
  return new Intl.NumberFormat("it-IT").format(Math.round(value));
}

export function formatPercentage(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace(".", ",")}%`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

export function computeDelta(current: number, previous: number | null | undefined): number | null {
  if (previous === null || previous === undefined || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
