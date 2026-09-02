export type DailyEntry = {
  entry_date: string;
  read_literature: boolean;
  morning_reflection: boolean;
  call_sponsor: boolean;
  call_fellowship: boolean;
  attended_meeting: boolean;
  stayed_sober: boolean;
  evening_reflection: boolean;
};

export const CHECKLIST_FIELDS = [
  "read_literature",
  "morning_reflection",
  "call_sponsor",
  "call_fellowship",
  "attended_meeting",
  "stayed_sober",
  "evening_reflection",
] as const;

export type ChecklistField = (typeof CHECKLIST_FIELDS)[number];

export function isEntryComplete(entry: Pick<DailyEntry, ChecklistField>): boolean {
  return CHECKLIST_FIELDS.every((field) => entry[field]);
}

function toUTCDays(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Consecutive complete days ending today (if today is already complete) or
 * yesterday (so an in-progress day doesn't prematurely zero the streak).
 */
export function calculateDayStreak(entries: DailyEntry[], today: string): number {
  const completeByDate = new Map<string, boolean>();
  for (const entry of entries) {
    completeByDate.set(entry.entry_date, isEntryComplete(entry));
  }

  let cursor = completeByDate.get(today) ? today : shiftDate(today, -1);
  let streak = 0;

  while (completeByDate.get(cursor)) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

/** First pass: whole completed 7-day blocks within the current day streak. */
export function calculateWeekStreak(dayStreak: number): number {
  return Math.floor(dayStreak / 7);
}

export function daysSince(sobrietyDate: string, today: string): number {
  return Math.max(0, toUTCDays(today) - toUTCDays(sobrietyDate));
}
