"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_CHECKLIST_ITEMS } from "@/lib/streaks";

type CompleteOnboardingInput = {
  username: string;
  sobrietyDate: string;
  hasSponsor: boolean;
  hasServicePosition: boolean;
  hasHomegroup: boolean;
  timezone: string;
};

export async function completeOnboarding(input: CompleteOnboardingInput) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    username: input.username,
    sobriety_date: input.sobrietyDate,
    has_sponsor: input.hasSponsor,
    has_service_position: input.hasServicePosition,
    has_homegroup: input.hasHomegroup,
    timezone: input.timezone,
  });

  if (error) {
    return { error: error.message };
  }

  const { error: checklistError } = await supabase.from("checklist_items").insert(
    DEFAULT_CHECKLIST_ITEMS.map((label, index) => ({
      user_id: userId,
      label,
      sort_order: index,
    })),
  );

  if (checklistError) {
    console.error("[onboarding] failed to seed checklist items:", checklistError.message);
  }

  redirect("/dashboard");
}
