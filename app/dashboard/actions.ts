"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type UpdateProfileInput = {
  username: string;
  hasSponsor: boolean;
  sobrietyDate: string;
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
    .update({ username, has_sponsor: input.hasSponsor, sobriety_date: input.sobrietyDate })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return {};
}
