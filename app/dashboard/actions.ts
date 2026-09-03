"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileInput = {
  username: string;
  hasSponsor: boolean;
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
