import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribeToken";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false },
};

type UnsubscribePageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams;
  const userId = token ? verifyUnsubscribeToken(token) : null;

  if (!userId) {
    return (
      <main id="main" className="policy">
        <h1>This unsubscribe link isn&apos;t valid</h1>
        <p>
          It may be old or mistyped. Sign in and update your email preferences from your profile
          instead.
        </p>
      </main>
    );
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ marketing_emails_opt_in: false })
    .eq("id", userId);

  return (
    <main id="main" className="policy">
      <h1>{error ? "Something went wrong" : "You're unsubscribed"}</h1>
      <p>
        {error
          ? "We couldn't process that. Try again from your profile settings, or reach out if it keeps happening."
          : "You won't get product update or tips emails anymore. Transactional emails you've opted into, like reminders, aren't affected."}
      </p>
    </main>
  );
}
