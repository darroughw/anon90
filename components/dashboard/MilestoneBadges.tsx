import { Badge } from "@/components/ui";
import type { Milestone } from "@/lib/milestones";

export default function MilestoneBadges({ earned }: { earned: Milestone[] }) {
  if (earned.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Milestones reached</h2>
      <div className="ds-row">
        {earned.map((milestone) => (
          <Badge key={milestone.days}>{milestone.label}</Badge>
        ))}
      </div>
    </div>
  );
}
