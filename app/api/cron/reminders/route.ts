import { NextResponse } from "next/server";
import { sendPush } from "@/lib/apns";
import { createAdminClient } from "@/lib/supabase/admin";
import { requiredItemsForDate } from "@/lib/streaks";
import { localDateString, localHour } from "@/lib/timezone";

// ~3 hours before the midnight day boundary (docs/mvp-scope.md -> Reminders).
const REMINDER_HOUR = 21;

/**
 * Runs hourly (see README -> Reminders & cron). For each user with push reminders on,
 * whose local time is REMINDER_HOUR, sends a push to every registered device if today's
 * checklist (in their local timezone) isn't complete yet.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, timezone")
    .eq("reminder_push_enabled", true);

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

    const { data: tokens } = await supabase
      .from("device_tokens")
      .select("id, token")
      .eq("user_id", profile.id);

    if (!tokens || tokens.length === 0) continue;

    let sentToUser = false;

    for (const device of tokens) {
      const result = await sendPush(device.token, tasksRemaining);

      if (result.ok) {
        sentToUser = true;
      } else {
        console.error("[cron/reminders] APNs error for", profile.id, result.error);
        if (result.shouldForget) {
          await supabase.from("device_tokens").delete().eq("id", device.id);
        }
      }
    }

    if (sentToUser) sent += 1;
  }

  return NextResponse.json({ checked: due.length, sent });
}
