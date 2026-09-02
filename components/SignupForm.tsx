"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type SubmitPayload = { email?: string; idToken?: string; consent: boolean };

export default function SignupForm() {
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null);

  const submitSignup = useCallback(async (payload: SubmitPayload) => {
    setSubmitting(true);
    setStatus("Sending...");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("");
      setRegistered(true);
      return true;
    } catch {
      setStatus("Something went wrong. Try again in a moment.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleGoogleCredential = useCallback(
    (response: google.accounts.id.CredentialResponse) => {
      submitSignup({ idToken: response.credential, consent: true });
    },
    [submitSignup],
  );

  useEffect(() => {
    if (registered) {
      confirmationHeadingRef.current?.focus();
    }
  }, [registered]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || registered) {
      return;
    }

    let cancelled = false;

    function renderButton() {
      if (cancelled || !window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID as string,
        callback: handleGoogleCredential,
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        text: "continue_with",
        shape: "pill",
        width: 280,
      });
    }

    if (window.google?.accounts?.id) {
      renderButton();
      return;
    }

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        renderButton();
        clearInterval(interval);
      }
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [handleGoogleCredential, registered]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form.elements.namedItem("email") as HTMLInputElement;
    const consent = form.elements.namedItem("consent") as HTMLInputElement;

    if (!email.value || !email.checkValidity()) {
      setStatus("Enter a valid email address.");
      email.focus();
      return;
    }

    if (!consent.checked) {
      setStatus("Check the box so we know it's okay to email you.");
      consent.focus();
      return;
    }

    await submitSignup({ email: email.value, consent: true });
  }

  if (registered) {
    return (
      <div className="signup-confirmation" role="status">
        <h2 ref={confirmationHeadingRef} tabIndex={-1}>
          You&apos;re registered
        </h2>
        <p>We&apos;ll email you when Rhythm Recovery is ready.</p>
      </div>
    );
  }

  return (
    <>
      <h2 id="signup-heading">Get early access</h2>

      {GOOGLE_CLIENT_ID && (
        <>
          <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
          <div className="google-signin">
            <div className="google-signin-button" ref={googleButtonRef} />
            <p className="hint">
              By continuing, you agree to receive an email when Rhythm Recovery is ready.
            </p>
          </div>
          <div className="divider" role="separator">
            or
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            aria-describedby="email-hint"
          />
          <p id="email-hint" className="hint">
            We&apos;ll only use this to tell you when Rhythm Recovery is ready.
          </p>
        </div>

        <div className="field field-checkbox">
          <input type="checkbox" id="consent" name="consent" required />
          <label htmlFor="consent">
            Email me when Rhythm Recovery is ready. Unsubscribe anytime.
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          Request early access
        </button>

        <p className="form-status" role="status" aria-live="polite">
          {status}
        </p>
      </form>
    </>
  );
}
