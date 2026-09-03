"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Dialog, FormField, Input, ProgressBar, Switch } from "@/components/ui";
import { updateProfile } from "@/app/dashboard/actions";
import { getNextMilestone, milestoneProgress } from "@/lib/milestones";
import { getDailyQuote } from "@/lib/quotes";
import { daysSince } from "@/lib/streaks";

type ProfileEditDialogProps = {
  open: boolean;
  onClose: () => void;
  username: string;
  hasSponsor: boolean;
  sobrietyDate: string;
};

function today(): string {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

export default function ProfileEditDialog({
  open,
  onClose,
  username,
  hasSponsor,
  sobrietyDate,
}: ProfileEditDialogProps) {
  const router = useRouter();
  const [usernameValue, setUsernameValue] = useState(username);
  const [sponsorValue, setSponsorValue] = useState(hasSponsor);
  const [sobrietyDateValue, setSobrietyDateValue] = useState(sobrietyDate);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const now = today();
  const sober = daysSince(sobrietyDateValue, now);
  const milestone = getNextMilestone(sober);
  const progress = milestoneProgress(sober, milestone);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await updateProfile({
      username: usernameValue,
      hasSponsor: sponsorValue,
      sobrietyDate: sobrietyDateValue,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit profile">
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div style={{ marginBottom: "1rem" }}>
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        <FormField
          label="Display name"
          htmlFor="profile-username"
          hint="Shown instead of your email anywhere your progress is shared."
        >
          <Input
            name="username"
            required
            minLength={3}
            maxLength={24}
            value={usernameValue}
            onChange={(event) => setUsernameValue(event.target.value)}
          />
        </FormField>

        <FormField
          label="Sobriety date"
          htmlFor="profile-sobriety-date"
          hint="Changing this recalculates your streak, days sober, and milestones."
        >
          <Input
            type="date"
            name="sobrietyDate"
            required
            max={now}
            value={sobrietyDateValue}
            onChange={(event) => setSobrietyDateValue(event.target.value)}
          />
        </FormField>

        <div style={{ marginBottom: "1.25rem" }}>
          <div className="ds-row" style={{ justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span className="hint">Next: {milestone.label}</span>
            <Badge>{Math.round(progress)}%</Badge>
          </div>
          <ProgressBar value={progress} label={`Progress toward ${milestone.label}`} />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <Switch label="I have a sponsor" checked={sponsorValue} onCheckedChange={setSponsorValue} />
        </div>

        <p className="hint" style={{ fontStyle: "italic", marginBottom: "0.5rem" }}>
          &ldquo;{getDailyQuote(now)}&rdquo;
        </p>
        <p className="hint" style={{ marginBottom: "1.5rem" }}>
          <a href="https://www.aa.org/daily-reflections" target="_blank" rel="noreferrer">
            Read today&apos;s AA Daily Reflection
          </a>
        </p>

        <Button type="submit" className="ds-button--block" disabled={submitting} loading={submitting}>
          Save changes
        </Button>
      </form>
    </Dialog>
  );
}
