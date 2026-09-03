"use client";

import { useState, type FormEvent } from "react";
import { Alert, Button, FormField, Input, Switch } from "@/components/ui";
import { completeOnboarding } from "./actions";

type Step = 1 | 2 | 3;

const today = () => new Date().toISOString().slice(0, 10);

export default function OnboardingWizard({ suggestedUsername }: { suggestedUsername: string }) {
  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState(suggestedUsername);
  const [sobrietyDate, setSobrietyDate] = useState("");
  const [hasSponsor, setHasSponsor] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleStep1(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim()) {
      setError("Enter a display name.");
      return;
    }
    setError("");
    setStep(2);
  }

  function handleStep2(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!sobrietyDate) {
      setError("Enter your sobriety date.");
      return;
    }
    if (sobrietyDate > today()) {
      setError("Sobriety date can't be in the future.");
      return;
    }
    setError("");
    setStep(3);
  }

  async function handleFinish() {
    setSubmitting(true);
    setError("");
    const result = await completeOnboarding({
      username: username.trim(),
      sobrietyDate,
      hasSponsor,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="hint">Step {step} of 3</p>

      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleStep1} noValidate>
          <FormField
            label="Display name"
            htmlFor="username"
            hint="We generated one for you. Change it if you'd like — you can edit it anytime from your profile."
          >
            <Input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={30}
              required
            />
          </FormField>
          <Button type="submit" className="ds-button--block">
            Continue
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleStep2} noValidate>
          <FormField
            label="Sobriety date"
            htmlFor="sobriety-date"
            hint="We count your days from here. This never resets — you can update it later if it changes."
          >
            <Input
              type="date"
              value={sobrietyDate}
              onChange={(event) => setSobrietyDate(event.target.value)}
              max={today()}
              required
            />
          </FormField>
          <div className="ds-row">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div>
          <Switch
            label="Do you have a sponsor?"
            checked={hasSponsor}
            onCheckedChange={setHasSponsor}
          />
          {!hasSponsor && (
            <p className="hint" style={{ marginTop: "0.75rem" }}>
              That&apos;s okay for now. We&apos;ll remind you to find one until you add it later.
            </p>
          )}
          <div className="ds-row" style={{ marginTop: "1.5rem" }}>
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={handleFinish} disabled={submitting} loading={submitting}>
              Finish
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
