import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { generateUsername } from "@/lib/generateUsername";
import { createClient } from "@/lib/supabase/server";
import OnboardingWizard from "./OnboardingWizard";

export const metadata: Metadata = {
  title: "Set Up Your Account",
  robots: { index: false },
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.claims.sub as string)
    .maybeSingle();

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <main id="main" className="ds-page">
      <h1>Set up your account</h1>
      <OnboardingWizard suggestedUsername={generateUsername()} />
    </main>
  );
}
