"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileInput = {
  username: string;
  hasSponsor: boolean;
  hasServicePosition: boolean;
  hasHomegroup: boolean;
  sobrietyDate: string;
  reminderToastEnabled: boolean;
  reminderEmailEnabled: boolean;
  marketingEmailsOptIn: boolean;
};

type UpdateProfileResult = { error: string } | { error?: undefined };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  if (!userId) {
    return { error: "Your session expired. Sign in again." };
  }

  const username = input.username.trim();
  if (username.length < 3 || username.length > 24) {
    return { error: "Display name must be 3-24 characters." };
  }

  if (!DATE_RE.test(input.sobrietyDate) || input.sobrietyDate > new Date().toISOString().slice(0, 10)) {
    return { error: "Enter a valid sobriety date, not in the future." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      username,
      has_sponsor: input.hasSponsor,
      has_service_position: input.hasServicePosition,
      has_homegroup: input.hasHomegroup,
      sobriety_date: input.sobrietyDate,
      reminder_toast_enabled: input.reminderToastEnabled,
      reminder_email_enabled: input.reminderEmailEnabled,
      marketing_emails_opt_in: input.marketingEmailsOptIn,
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

type DeleteAccountResult = { error: string } | { error?: undefined };

/**
 * Permanently deletes the signed-in user's data and their Supabase auth
 * account. Order matters: delete child rows before the parent, then the
 * auth user last, so this is safe regardless of what (if any) cascading
 * foreign keys exist between profiles and auth.users.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;

  if (!userId) {
    return { error: "Your session expired. Sign in again." };
  }

  const admin = createAdminClient();

  const { error: entriesError } = await admin.from("daily_entries").delete().eq("user_id", userId);
  if (entriesError) {
    return { error: entriesError.message };
  }

  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError) {
    return { error: profileError.message };
  }

  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return { error: authError.message };
  }

  return {};
}

type ChecklistItemResult = { error: string } | { error?: undefined };

const LABEL_MAX_LENGTH = 80;

async function requireUserId(): Promise<string | { error: string }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub as string | undefined;
  return userId ?? { error: "Your session expired. Sign in again." };
}

export async function addChecklistItem(label: string): Promise<ChecklistItemResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const trimmed = label.trim();
  if (trimmed.length < 1 || trimmed.length > LABEL_MAX_LENGTH) {
    return { error: `Checklist item must be 1-${LABEL_MAX_LENGTH} characters.` };
  }

  const supabase = await createClient();

  const { data: last } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("user_id", userId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = (last?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase
    .from("checklist_items")
    .insert({ user_id: userId, label: trimmed, sort_order: nextOrder });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function renameChecklistItem(id: string, label: string): Promise<ChecklistItemResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const trimmed = label.trim();
  if (trimmed.length < 1 || trimmed.length > LABEL_MAX_LENGTH) {
    return { error: `Checklist item must be 1-${LABEL_MAX_LENGTH} characters.` };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("checklist_items")
    .update({ label: trimmed })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

/**
 * Archiving is the only "removal" users get -- history stays intact, and
 * archived items stop counting toward required tasks for every date, past
 * included (see lib/streaks.ts). Always leave at least one active item,
 * or the checklist (and streak) has nothing to be complete against.
 */
export async function setChecklistItemArchived(
  id: string,
  archived: boolean,
): Promise<ChecklistItemResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();

  if (archived) {
    const { count } = await supabase
      .from("checklist_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("archived", false)
      .neq("id", id);

    if (!count) {
      return { error: "You need at least one active checklist item." };
    }
  }

  const { error } = await supabase
    .from("checklist_items")
    .update({ archived })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}

export async function reorderChecklistItem(
  id: string,
  direction: "up" | "down",
): Promise<ChecklistItemResult> {
  const userId = await requireUserId();
  if (typeof userId !== "string") return userId;

  const supabase = await createClient();

  const { data: items, error: fetchError } = await supabase
    .from("checklist_items")
    .select("id, sort_order")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("sort_order", { ascending: true });

  if (fetchError) {
    return { error: fetchError.message };
  }

  const list = items ?? [];
  const index = list.findIndex((item) => item.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= list.length) {
    return {};
  }

  const a = list[index];
  const b = list[swapIndex];

  const { error: errorA } = await supabase
    .from("checklist_items")
    .update({ sort_order: b.sort_order })
    .eq("id", a.id)
    .eq("user_id", userId);

  if (errorA) {
    return { error: errorA.message };
  }

  const { error: errorB } = await supabase
    .from("checklist_items")
    .update({ sort_order: a.sort_order })
    .eq("id", b.id)
    .eq("user_id", userId);

  if (errorB) {
    return { error: errorB.message };
  }

  revalidatePath("/dashboard");
  return {};
}
