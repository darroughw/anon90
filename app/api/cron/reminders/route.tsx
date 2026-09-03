import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import ReminderEmail, { subject } from "@/emails/reminder";
import { createAdminClient } from "@/lib/supabase/admin";
import { requiredItemsForDate } from "@/lib/streaks";
import { localDateString, localHour } from "@/lib/timezone";

const FROM = process.env.EMAIL_FROM || "Rhythm Recovery <onboarding@resend.dev>";

// ~3 hours before the midnight day boundary (docs/mvp-scope.md -> Reminders).
const REMINDER_HOUR = 21;

/**
 * Runs hourly (see vercel.json). For each user with email reminders on,
 * whose local time is REMINDER_HOUR, sends a reminder if today's checklist
 * (in their local timezone) isn't complete yet.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("[cron/reminders] RESEND_API_KEY not set, skipping run");
    return NextResponse.json({ checked: 0, sent: 0 });
  }

  const supabase = createAdminClient();
  const resend = new Resend(resendApiKey);

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, timezone")
    .eq("reminder_email_enabled", true);

  if (error) {
    console.error("[cron/reminders] failed to load profiles:", error.message);
    return NextResponse.json({ error: "Failed to load profiles" }, { status: 500 });
  }

  const due = (profiles ?? []).filter((profile) => localHour(profile.timezone) === REMINDER_HOUR);

  let sent = 0;

  for (const profile of due) {
    const today = localDateString(profile.timezone);

    const { data: items } = await supabase
      .from("checklist_items")
      .select("id, label, sort_order, archived, created_at")
      .eq("user_id", profile.id);

    const required = requiredItemsForDate(items ?? [], today);
    if (required.length === 0) continue;

    const { data: completions } = await supabase
      .from("daily_entry_completions")
      .select("checklist_item_id")
      .eq("user_id", profile.id)
      .eq("entry_date", today)
      .eq("completed", true);

    const completedIds = new Set((completions ?? []).map((c) => c.checklist_item_id));
    const tasksRemaining = required.filter((item) => !completedIds.has(item.id)).length;

    if (tasksRemaining === 0) continue;

    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    const email = userData?.user?.email;
    if (!email) continue;

    const html = await render(<ReminderEmail tasksRemaining={tasksRemaining} />);
    const { error: sendError } = await resend.emails.send({ from: FROM, to: email, subject, html });

    if (sendError) {
      console.error("[cron/reminders] Resend error for", profile.id, sendError.message);
    } else {
      sent += 1;
    }
  }

  return NextResponse.json({ checked: due.length, sent });
}
