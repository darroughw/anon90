const FIXED_MILESTONES = [
  { days: 90, label: "90 days" },
  { days: 180, label: "6 months" },
  { days: 270, label: "9 months" },
  { days: 365, label: "1 year" },
  { days: 545, label: "18 months" },
];

export type Milestone = {
  days: number;
  label: string;
  previousDays: number;
};

/** 90 days, 6/9/18 months, 1 year, then annually — matches docs/mvp-scope.md → Milestones. */
function* milestoneSequence(): Generator<{ days: number; label: string }> {
  yield* FIXED_MILESTONES;

  let years = 2;
  let target = 730;
  while (true) {
    yield { days: target, label: `${years} years` };
    target += 365;
    years += 1;
  }
}

export function getNextMilestone(daysSober: number): Milestone {
  let previousDays = 0;

  for (const milestone of milestoneSequence()) {
    if (daysSober < milestone.days) {
      return { ...milestone, previousDays };
    }
    previousDays = milestone.days;
  }

  throw new Error("unreachable");
}

/** Every milestone already reached, in order — each one earns a badge. */
export function getEarnedMilestones(daysSober: number): Milestone[] {
  const earned: Milestone[] = [];
  let previousDays = 0;

  for (const milestone of milestoneSequence()) {
    if (milestone.days > daysSober) break;
    earned.push({ ...milestone, previousDays });
    previousDays = milestone.days;
  }

  return earned;
}

export function milestoneProgress(daysSober: number, milestone: Milestone): number {
  const span = milestone.days - milestone.previousDays;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((daysSober - milestone.previousDays) / span) * 100));
}
