export type ChecklistItem = {
  id: string;
  label: string;
  sort_order: number;
  archived: boolean;
  created_at: string;
};

/** Starting suggestions seeded for every new profile -- fully editable from there on. */
export const DEFAULT_CHECKLIST_ITEMS = [
  "Read literature",
  "Pray or meditate (morning)",
  "Call your sponsor",
  "Call someone in the fellowship",
  "Go to a meeting",
  "Didn't drink or use",
  "Pray or meditate (evening)",
] as const;

export type Completion = {
  entry_date: string;
  checklist_item_id: string;
  completed: boolean;
};

/** Items that actually applied on a given date: existed by then, not archived. */
export function requiredItemsForDate(items: ChecklistItem[], date: string): ChecklistItem[] {
  return items.filter((item) => !item.archived && item.created_at.slice(0, 10) <= date);
}

/**
 * A day counts complete only if every item that applied *on that date*
 * was checked. Items added later don't retroactively break old streaks;
 * archived items stop counting for every date, past included -- if you
 * don't do it anymore, past days shouldn't be held to it either.
 */
export function isDateComplete(
  items: ChecklistItem[],
  completedItemIds: ReadonlySet<string>,
  date: string,
): boolean {
  const required = requiredItemsForDate(items, date);
  if (required.length === 0) return false;
  return required.every((item) => completedItemIds.has(item.id));
}

function toUTCDays(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

export function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function groupCompletedIdsByDate(completions: Completion[]): Map<string, Set<string>> {
  const byDate = new Map<string, Set<string>>();
  for (const completion of completions) {
    if (!completion.completed) continue;
    let set = byDate.get(completion.entry_date);
    if (!set) {
      set = new Set();
      byDate.set(completion.entry_date, set);
    }
    set.add(completion.checklist_item_id);
  }
  return byDate;
}

/**
 * Consecutive complete days ending today (if today is already complete) or
 * yesterday (so an in-progress day doesn't prematurely zero the streak).
 */
export function calculateDayStreak(
  items: ChecklistItem[],
  completions: Completion[],
  today: string,
): number {
  const completedByDate = groupCompletedIdsByDate(completions);
  const empty = new Set<string>();
  const dateComplete = (date: string) =>
    isDateComplete(items, completedByDate.get(date) ?? empty, date);

  let cursor = dateComplete(today) ? today : shiftDate(today, -1);
  let streak = 0;

  while (dateComplete(cursor)) {
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
