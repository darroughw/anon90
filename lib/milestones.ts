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

export function getNextMilestone(daysSober: number): Milestone {
  let previousDays = 0;

  for (const milestone of FIXED_MILESTONES) {
    if (daysSober < milestone.days) {
      return { ...milestone, previousDays };
    }
    previousDays = milestone.days;
  }

  let years = 2;
  let target = 730;
  while (daysSober >= target) {
    previousDays = target;
    target += 365;
    years += 1;
  }

  return { days: target, label: `${years} years`, previousDays };
}

export function milestoneProgress(daysSober: number, milestone: Milestone): number {
  const span = milestone.days - milestone.previousDays;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((daysSober - milestone.previousDays) / span) * 100));
}
