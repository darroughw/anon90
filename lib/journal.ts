import { shiftDate } from "./streaks";

export type JournalEntry = {
  entry_date: string;
  journal: string;
};

export type JournalAnniversary = JournalEntry & { monthsAgo: number };

const ANNIVERSARY_INTERVAL_DAYS = 30;

/** How far back to look for anniversaries -- 36 * 30 days is 3 years. */
const MAX_ANNIVERSARIES_BACK = 36;

/** Every date exactly N*30 days before today, N = 1..cap, nearest first. */
export function anniversaryCandidateDates(today: string, cap = MAX_ANNIVERSARIES_BACK): string[] {
  const dates: string[] = [];
  for (let n = 1; n <= cap; n++) {
    dates.push(shiftDate(today, -ANNIVERSARY_INTERVAL_DAYS * n));
  }
  return dates;
}

/**
 * Entries that were written exactly N*30 days ago -- a note surfaces as a
 * "1 month ago today" echo on day 30 after it was written, "2 months ago
 * today" on day 60, and so on. A prolific journaler can hit more than one
 * of these on the same day; all of them surface, nearest first.
 */
export function matchAnniversaries(
  entries: JournalEntry[],
  today: string,
  cap = MAX_ANNIVERSARIES_BACK,
): JournalAnniversary[] {
  const monthsAgoByDate = new Map(
    anniversaryCandidateDates(today, cap).map((date, index) => [date, index + 1]),
  );

  return entries
    .filter((entry) => entry.journal.trim().length > 0 && monthsAgoByDate.has(entry.entry_date))
    .map((entry) => ({ ...entry, monthsAgo: monthsAgoByDate.get(entry.entry_date)! }))
    .sort((a, b) => a.monthsAgo - b.monthsAgo);
}
