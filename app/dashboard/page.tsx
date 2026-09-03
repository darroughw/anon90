import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "username, sobriety_date, has_sponsor, reminder_toast_enabled, reminder_email_enabled, marketing_emails_opt_in",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <main id="main" className="ds-page">
      <DashboardClient profile={profile} />
    </main>
  );
}
