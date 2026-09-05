import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a New Password",
  robots: { index: false },
};

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  // Reached either via a valid recovery link (which the /auth/callback route
  // already exchanged for a session before redirecting here) or by an
  // already-signed-in user choosing to change their password -- both are
  // legitimate. Anyone else gets sent to sign in first.
  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <main id="main" className="ds-page">
      <h1 style={{ textAlign: "center" }}>Set a new password</h1>
      <ResetPasswordForm />
    </main>
  );
}
