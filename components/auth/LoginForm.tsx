"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Button
        type="button"
        variant="secondary"
        className="ds-button--block"
        onClick={handleGoogle}
      >
        Continue with Google
      </Button>

      <div className="divider" role="separator">
        or
      </div>

      <FormField label="Email address" htmlFor="login-email">
        <Input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password">
        <Input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </FormField>

      <Button type="submit" className="ds-button--block" disabled={submitting} loading={submitting}>
        Sign in
      </Button>

      <p className="hint" style={{ textAlign: "center", marginTop: "1rem" }}>
        Need an account? <Link href="/signup">Create one</Link>
      </p>
    </form>
  );
}
