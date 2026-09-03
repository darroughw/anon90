"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  redirect("/dashboard");
}
