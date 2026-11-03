export function formatNumber(value: number, digits: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatKm(value: number, digits = 0): string {
  return `${formatNumber(value, digits)} km`;
}

export function formatMinutes(minutes: number): string {
  if (minutes >= 90) {
    const hours = Math.floor(minutes / 60);
    const rest = Math.round(minutes - hours * 60);
    return `${hours} h ${rest} m`;
  }
  return `${formatNumber(minutes, 1)} min`;
}

export function formatDegrees(value: number): string {
  return `${formatNumber(value, value >= 10 ? 1 : 2)}°`;
}

export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hourCycle: "h23",
  }).format(date);
  return `${formatted} UTC`;
}

export function formatLead(iso: string, now = Date.now()): string {
  const delta = new Date(iso).getTime() - now;
  const sign = delta >= 0 ? "in " : "";
  const abs = Math.abs(delta);
  const hours = Math.floor(abs / 3_600_000);
  const minutes = Math.round((abs % 3_600_000) / 60_000);
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    const rem = hours % 24;
    return `${sign}${days} d ${rem} h`;
  }
  if (hours >= 1) return `${sign}${hours} h ${minutes} m`;
  return `${sign}${minutes} m`;
}

export function formatProbability(value: number): string {
  if (value <= 0) return "—";
  if (value < 0.001) return value.toExponential(1);
  return value.toFixed(4);
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
