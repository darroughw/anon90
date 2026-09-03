"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  ProgressBar,
  StatDisplay,
  Textarea,
  ToastProvider,
  useToast,
} from "@/components/ui";
import ChecklistItem from "@/components/dashboard/ChecklistItem";
import ChecklistManageDialog from "@/components/dashboard/ChecklistManageDialog";
import DailyProgressBar from "@/components/dashboard/DailyProgressBar";
import DailyQuote from "@/components/dashboard/DailyQuote";
import HelpfulLinks from "@/components/dashboard/HelpfulLinks";
import JournalEcho from "@/components/dashboard/JournalEcho";
import MilestoneBadges from "@/components/dashboard/MilestoneBadges";
import ProfileEditDialog from "@/components/dashboard/ProfileEditDialog";
import { anniversaryCandidateDates, matchAnniversaries, type JournalAnniversary } from "@/lib/journal";
import { getEarnedMilestones, getNextMilestone, milestoneProgress } from "@/lib/milestones";
import { createClient } from "@/lib/supabase/client";
import {
  calculateDayStreak,
  calculateWeekStreak,
  daysSince,
  isDateComplete,
  requiredItemsForDate,
  type ChecklistItem as ChecklistItemType,
  type Completion,
} from "@/lib/streaks";

type Profile = {
  username: string;
  sobriety_date: string;
  has_sponsor: boolean;
  has_service_position: boolean;
  has_homegroup: boolean;
  reminder_toast_enabled: boolean;
  reminder_email_enabled: boolean;
  marketing_emails_opt_in: boolean;
};

function localToday(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function DashboardInner({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = useMemo(() => createClient(), []);
  const today = useMemo(() => localToday(), []);
  const reminded = useRef(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<ChecklistItemType[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [anniversaries, setAnniversaries] = useState<JournalAnniversary[]>([]);
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(true);
  const [journalStatus, setJournalStatus] = useState("");
  const [error, setError] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState(false);

  async function loadChecklistItems() {
    const { data } = await supabase
      .from("checklist_items")
      .select("id, label, sort_order, archived, created_at")
      .eq("archived", false)
      .order("sort_order", { ascending: true });

    if (data) setItems(data as ChecklistItemType[]);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: claims } = await supabase.auth.getClaims();
      const id = claims?.claims.sub as string | undefined;
      if (!id) return;

      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 60);
      const since = sinceDate.toISOString().slice(0, 10);

      const [itemsResult, completionsResult, journalResult, anniversariesResult] = await Promise.all([
        supabase
          .from("checklist_items")
          .select("id, label, sort_order, archived, created_at")
          .eq("archived", false)
          .order("sort_order", { ascending: true }),
        supabase
          .from("daily_entry_completions")
          .select("entry_date, checklist_item_id, completed")
          .gte("entry_date", since),
        supabase.from("daily_entries").select("journal").eq("entry_date", today).maybeSingle(),
        supabase
          .from("daily_entries")
          .select("entry_date, journal")
          .in("entry_date", anniversaryCandidateDates(today)),
      ]);

      if (cancelled) return;

      if (itemsResult.error || completionsResult.error) {
        setError("Couldn't load today's checklist. Try refreshing.");
      } else {
        if (itemsResult.data) setItems(itemsResult.data as ChecklistItemType[]);
        if (completionsResult.data) setCompletions(completionsResult.data as Completion[]);
        setJournal((journalResult.data as { journal: string } | null)?.journal ?? "");
        if (anniversariesResult.data) {
          setAnniversaries(matchAnniversaries(anniversariesResult.data, today));
        }
      }

      setUserId(id);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, today]);

  const requiredToday = requiredItemsForDate(items, today);
  const todayCompletedIds = new Set(
    completions.filter((c) => c.entry_date === today && c.completed).map((c) => c.checklist_item_id),
  );
  const dayComplete = isDateComplete(items, todayCompletedIds, today);
  const completedToday = requiredToday.filter((item) => todayCompletedIds.has(item.id)).length;

  // Tracks whether today's completion state just flipped to true (as
  // opposed to loading in already-complete) so the celebration animation
  // only plays on the actual completing action, once, this session -- not
  // on every render of an already-finished day.
  const [trackedComplete, setTrackedComplete] = useState<boolean | null>(null);
  const [justCompletedDay, setJustCompletedDay] = useState(false);

  if (!loading && dayComplete !== trackedComplete) {
    setTrackedComplete(dayComplete);
    if (dayComplete && trackedComplete !== null) {
      setJustCompletedDay(true);
    }
  }

  useEffect(() => {
    if (loading || reminded.current || !profile.reminder_toast_enabled) return;
    if (new Date().getHours() < 21) return;
    if (dayComplete) return;

    reminded.current = true;
    showToast("It's later in the day. A few tasks are still open on today's list.");
  }, [loading, profile.reminder_toast_enabled, dayComplete, showToast]);

  async function toggleItem(itemId: string) {
    if (!userId) return;

    const completed = !todayCompletedIds.has(itemId);

    setCompletions((prev) => [
      ...prev.filter((c) => !(c.entry_date === today && c.checklist_item_id === itemId)),
      { entry_date: today, checklist_item_id: itemId, completed },
    ]);

    const { error: upsertError } = await supabase.from("daily_entry_completions").upsert(
      { user_id: userId, entry_date: today, checklist_item_id: itemId, completed },
      { onConflict: "user_id,entry_date,checklist_item_id" },
    );

    if (upsertError) {
      setError("Couldn't save that. Try again.");
    }
  }

  async function saveJournal() {
    if (!userId) return;

    setJournalStatus("Saving...");

    const { error: upsertError } = await supabase
      .from("daily_entries")
      .upsert({ user_id: userId, entry_date: today, journal }, { onConflict: "user_id,entry_date" });

    setJournalStatus(upsertError ? "Couldn't save." : "Saved");
  }

  async function handleLogOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const dayStreak = calculateDayStreak(items, completions, today);
  const weekStreak = calculateWeekStreak(dayStreak);
  const sober = daysSince(profile.sobriety_date, today);
  const milestone = getNextMilestone(sober);
  const progress = milestoneProgress(sober, milestone);
  const earnedMilestones = getEarnedMilestones(sober);

  if (loading) {
    return <p className="hint">Loading...</p>;
  }

  return (
    <div>
      <h1 style={{ textAlign: "center", marginBottom: "0.75rem" }}>
        Welcome back, {profile.username}
      </h1>
      <div
        className="ds-row"
        style={{ justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem" }}
      >
        <Button variant="secondary" onClick={() => setEditingProfile(true)}>
          Edit profile
        </Button>
        <Button variant="secondary" onClick={() => setEditingChecklist(true)}>
          Manage checklist
        </Button>
        <Button variant="secondary" onClick={handleLogOut}>
          Log out
        </Button>
      </div>

      <DailyQuote date={today} />

      <ProfileEditDialog
        key={editingProfile ? "profile-open" : "profile-closed"}
        open={editingProfile}
        onClose={() => setEditingProfile(false)}
        username={profile.username}
        hasSponsor={profile.has_sponsor}
        hasServicePosition={profile.has_service_position}
        hasHomegroup={profile.has_homegroup}
        sobrietyDate={profile.sobriety_date}
        reminderToastEnabled={profile.reminder_toast_enabled}
        reminderEmailEnabled={profile.reminder_email_enabled}
        marketingEmailsOptIn={profile.marketing_emails_opt_in}
      />

      <ChecklistManageDialog
        key={editingChecklist ? "checklist-open" : "checklist-closed"}
        open={editingChecklist}
        onClose={() => setEditingChecklist(false)}
        onChanged={loadChecklistItems}
      />

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {!profile.has_sponsor && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert variant="info">
            Consider finding a sponsor. You can add one anytime from your profile.
          </Alert>
        </div>
      )}

      {!profile.has_service_position && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert variant="info">
            Consider taking on a service position. You can add one anytime from your profile.
          </Alert>
        </div>
      )}

      {!profile.has_homegroup && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert variant="info">
            Consider finding a homegroup. You can add one anytime from your profile.
          </Alert>
        </div>
      )}

      <div className="ds-row" style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
        <StatDisplay value={dayStreak} label="Day streak" />
        <StatDisplay value={weekStreak} label="Week streak" />
        <StatDisplay value={sober} label="Days sober" />
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <div className="ds-row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
          <span className="hint">Next: {milestone.label}</span>
          <Badge>{Math.round(progress)}%</Badge>
        </div>
        <ProgressBar value={progress} label={`Progress toward ${milestone.label}`} />
      </div>

      <MilestoneBadges earned={earnedMilestones} />

      <JournalEcho anniversaries={anniversaries} />

      <Card
        className={[
          "ds-checklist-card",
          dayComplete && "ds-checklist-card--complete",
          justCompletedDay && "ds-checklist-card--just-completed",
        ]
          .filter(Boolean)
          .join(" ")}
        onAnimationEnd={() => setJustCompletedDay(false)}
      >
        <div className="ds-day-complete-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 style={{ marginTop: 0 }}>Today&apos;s checklist</h2>
        <DailyProgressBar completed={completedToday} total={requiredToday.length} />
        {dayComplete && (
          <p className="hint" role="status" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
            Today&apos;s list is complete.
          </p>
        )}
        {requiredToday.map((item) => (
          <div key={item.id} style={{ marginBottom: "0.6rem" }}>
            <ChecklistItem
              label={item.label}
              checked={todayCompletedIds.has(item.id)}
              onChange={() => toggleItem(item.id)}
            />
          </div>
        ))}

        <div style={{ marginTop: "1.25rem" }}>
          <label className="ds-field__label" htmlFor="journal">
            A note to your future self
          </label>
          <Textarea
            id="journal"
            value={journal}
            onChange={(event) => setJournal(event.target.value)}
            onBlur={saveJournal}
          />
          <p className="ds-field__hint">{journalStatus}</p>
          <Link href="/dashboard/journal" className="hint">
            View your past notes &rarr;
          </Link>
        </div>
      </Card>

      <p className="hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        <a href="https://www.aa.org/daily-reflections" target="_blank" rel="noreferrer">
          Read today&apos;s AA Daily Reflection
        </a>
      </p>

      <div style={{ marginTop: "2rem" }}>
        <HelpfulLinks />
      </div>
    </div>
  );
}

export default function DashboardClient({ profile }: { profile: Profile }) {
  return (
    <ToastProvider>
      <DashboardInner profile={profile} />
    </ToastProvider>
  );
}
