/** Local hour (0-23) in the given IANA timezone, for a server process with no "device" of its own. */
export function localHour(timeZone: string, at: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hour12: false,
  }).format(at);
  return Number(formatted) % 24;
}

/** Local calendar date (YYYY-MM-DD) in the given IANA timezone. */
export function localDateString(timeZone: string, at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}
