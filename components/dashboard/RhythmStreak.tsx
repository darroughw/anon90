import { Card, StatDisplay } from "@/components/ui";
import type { DayStatus } from "@/lib/streaks";

type RhythmStreakProps = {
  dayStreak: number;
  weekStreak: number;
  history: DayStatus[];
};

// Decorative height variation among complete days -- echoes the wordmark's
// waveform. Purely cosmetic: only fill color encodes complete vs. missed, a
// missed day is always the same flat height regardless of position.
const ON_HEIGHTS = [38, 52, 44, 60, 48, 56, 42];
const OFF_HEIGHT = 14;

export default function RhythmStreak({ dayStreak, weekStreak, history }: RhythmStreakProps) {
  return (
    <Card style={{ marginBottom: "1.5rem" }}>
      <div className="ds-row" style={{ gap: "2rem", marginBottom: "1.1rem" }}>
        <StatDisplay value={dayStreak} label="Day streak" />
        <StatDisplay value={weekStreak} label="Week streak" />
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
        <span>{history.length} days ago</span>
        <span>Today</span>
      </div>
    </Card>
  );
}
