"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <Alert variant="info">
        If an account exists for that email, a reset link is on its way. Check your inbox
        (and spam folder), then follow the link to set a new password.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <FormField label="Email address" htmlFor="forgot-password-email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>

      <Button type="submit" className="ds-button--block" disabled={submitting} loading={submitting}>
        Send reset link
      </Button>

      <p className="hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        <Link href="/login">Back to sign in</Link>
      </p>
    </form>
  );
}
