import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your Notes",
  robots: { index: false },
};

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export default async function JournalHistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: entries } = await supabase
    .from("daily_entries")
    .select("entry_date, journal")
    .eq("user_id", userId)
    .neq("journal", "")
    .order("entry_date", { ascending: false });

  const notes = (entries ?? []).filter((entry) => entry.journal.trim().length > 0);

  return (
    <main id="main" className="ds-page">
      <h1>Your notes</h1>
      <p className="hint" style={{ marginBottom: "1.5rem" }}>
        Everything you&apos;ve written to your future self, newest first.
      </p>

      {notes.length === 0 ? (
        <p className="hint">
          Nothing here yet. Notes you save from the dashboard&apos;s checklist will show up here.
        </p>
      ) : (
        notes.map((entry) => (
          <Card key={entry.entry_date} style={{ marginBottom: "1rem" }}>
            <p className="hint" style={{ marginBottom: "0.4rem" }}>
              {formatDate(entry.entry_date)}
            </p>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{entry.journal}</p>
          </Card>
        ))
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/dashboard">&larr; Back to dashboard</Link>
      </p>
    </main>
  );
}
