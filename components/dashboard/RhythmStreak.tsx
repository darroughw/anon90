"use client";

import { useState } from "react";
import { Card, StatDisplay } from "@/components/ui";
import { recentCompletionHistory, type ChecklistItem, type Completion } from "@/lib/streaks";

const RANGE_OPTIONS = [7, 10, 30] as const;
type Range = (typeof RANGE_OPTIONS)[number];
const STORAGE_KEY = "rhythm-recovery:rhythm-range";

function isRange(value: number): value is Range {
  return (RANGE_OPTIONS as readonly number[]).includes(value);
}

function loadStoredRange(): Range {
  if (typeof window === "undefined") return 7;
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return isRange(stored) ? stored : 7;
  } catch {
    return 7;
  }
}

type RhythmStreakProps = {
  dayStreak: number;
  weekStreak: number;
  items: ChecklistItem[];
  completions: Completion[];
  today: string;
};

// Decorative height variation among complete days -- echoes the wordmark's
// waveform. Purely cosmetic: only fill color encodes complete vs. missed, a
// missed day is always the same flat height regardless of position.
const ON_HEIGHTS = [38, 52, 44, 60, 48, 56, 42];
const OFF_HEIGHT = 14;

export default function RhythmStreak({ dayStreak, weekStreak, items, completions, today }: RhythmStreakProps) {
  const [range, setRange] = useState<Range>(loadStoredRange);
  const history = recentCompletionHistory(items, completions, today, range);

  function selectRange(next: Range) {
    setRange(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Private browsing / storage disabled -- selection just won't persist.
    }
  }

  return (
    <Card style={{ marginBottom: "1.5rem" }}>
      <div
        className="ds-row"
        style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.1rem" }}
      >
        <div className="ds-row" style={{ gap: "2rem" }}>
          <StatDisplay value={dayStreak} label="Day streak" />
          <StatDisplay value={weekStreak} label="Week streak" />
        </div>
        <div className="ds-rhythm__range" role="group" aria-label="Days to show">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className="ds-rhythm__range-btn"
              aria-pressed={range === option}
              onClick={() => selectRange(option)}
            >
              {option}d
            </button>
          ))}
        </div>
      </div>
      <div className="ds-rhythm__strip" aria-hidden="true">
        {history.map((day, index) => (
          <div
            key={day.date}
            className={[
              "ds-rhythm__bar",
              day.complete && "ds-rhythm__bar--on",
              index === history.length - 1 && "ds-rhythm__bar--today",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ height: `${day.complete ? ON_HEIGHTS[index % ON_HEIGHTS.length] : OFF_HEIGHT}px` }}
            title={`${day.date}${day.complete ? " — complete" : ""}`}
          />
        ))}
      </div>
      <div className="ds-rhythm__axis">
        <span>{range} days ago</span>
        <span>Today</span>
      </div>
    </Card>
  );
}
