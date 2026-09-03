import { Card } from "@/components/ui";
import type { JournalAnniversary } from "@/lib/journal";

function monthsLabel(monthsAgo: number): string {
  return monthsAgo === 1 ? "1 month ago today" : `${monthsAgo} months ago today`;
}

export default function JournalEcho({ anniversaries }: { anniversaries: JournalAnniversary[] }) {
  if (anniversaries.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {anniversaries.map((entry) => (
        <Card key={entry.entry_date} style={{ marginBottom: "0.75rem" }}>
          <p className="hint" style={{ marginBottom: "0.4rem" }}>
            {monthsLabel(entry.monthsAgo)}, you wrote:
          </p>
          <p style={{ margin: 0, fontStyle: "italic" }}>&ldquo;{entry.journal}&rdquo;</p>
        </Card>
      ))}
    </div>
  );
}
