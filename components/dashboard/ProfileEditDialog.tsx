"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Dialog,
  Divider,
  FormField,
  Input,
  ProgressBar,
  Switch,
} from "@/components/ui";
import { deleteAccount, updateProfile } from "@/app/dashboard/actions";
import { getNextMilestone, milestoneProgress } from "@/lib/milestones";
import { getDailyQuote } from "@/lib/quotes";
import { createClient } from "@/lib/supabase/client";
import { daysSince } from "@/lib/streaks";

type ProfileEditDialogProps = {
  open: boolean;
  onClose: () => void;
  username: string;
  hasSponsor: boolean;
  hasServicePosition: boolean;
  hasHomegroup: boolean;
  sobrietyDate: string;
  reminderToastEnabled: boolean;
  reminderEmailEnabled: boolean;
  marketingEmailsOptIn: boolean;
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
  hasServicePosition,
  hasHomegroup,
  sobrietyDate,
  reminderToastEnabled,
  reminderEmailEnabled,
  marketingEmailsOptIn,
}: ProfileEditDialogProps) {
  const router = useRouter();
  const [usernameValue, setUsernameValue] = useState(username);
  const [sponsorValue, setSponsorValue] = useState(hasSponsor);
  const [servicePositionValue, setServicePositionValue] = useState(hasServicePosition);
  const [homegroupValue, setHomegroupValue] = useState(hasHomegroup);
  const [sobrietyDateValue, setSobrietyDateValue] = useState(sobrietyDate);
  const [reminderToastValue, setReminderToastValue] = useState(reminderToastEnabled);
  const [reminderEmailValue, setReminderEmailValue] = useState(reminderEmailEnabled);
  const [marketingOptInValue, setMarketingOptInValue] = useState(marketingEmailsOptIn);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
      hasServicePosition: servicePositionValue,
      hasHomegroup: homegroupValue,
      sobrietyDate: sobrietyDateValue,
      reminderToastEnabled: reminderToastValue,
      reminderEmailEnabled: reminderEmailValue,
      marketingEmailsOptIn: marketingOptInValue,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh();
    onClose();
  }

  async function handleDeleteAccount() {
    setDeleteError("");
    setDeleting(true);

    const result = await deleteAccount();

    if (result.error) {
      setDeleting(false);
      setDeleteError(result.error);
      return;
    }

    // The account row is already gone server-side; this just clears the
    // local session so the client stops thinking it's signed in.
    await createClient().auth.signOut();
    router.push("/login?deleted=1");
    router.refresh();
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

        <div style={{ marginBottom: "0.75rem" }}>
          <Switch label="I have a sponsor" checked={sponsorValue} onCheckedChange={setSponsorValue} />
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <Checkbox
            label="I have a service position"
            checked={servicePositionValue}
            onChange={(event) => setServicePositionValue(event.target.checked)}
          />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <Checkbox
            label="I have a homegroup"
            checked={homegroupValue}
            onChange={(event) => setHomegroupValue(event.target.checked)}
          />
        </div>

        <Divider />

        <div style={{ marginBottom: "0.75rem" }}>
          <Switch
            label="Remind me in-app if today's list is still open"
            checked={reminderToastValue}
            onCheckedChange={setReminderToastValue}
          />
        </div>
        <div style={{ marginBottom: "0.75rem" }}>
          <Switch
            label="Email me if today's list is still open"
            checked={reminderEmailValue}
            onCheckedChange={setReminderEmailValue}
          />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <Switch
            label="Send me product updates and tips"
            checked={marketingOptInValue}
            onCheckedChange={setMarketingOptInValue}
          />
        </div>

        <Divider />

        <p className="hint" style={{ fontStyle: "italic", marginBottom: "0.5rem", marginTop: "1.25rem" }}>
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

      <Divider />

      {deleteError && (
        <div style={{ marginBottom: "1rem" }}>
          <Alert variant="error">{deleteError}</Alert>
        </div>
      )}

      {!confirmingDelete ? (
        <Button
          type="button"
          variant="ghost"
          style={{ color: "var(--error)" }}
          onClick={() => setConfirmingDelete(true)}
        >
          Delete account
        </Button>
      ) : (
        <div>
          <p className="hint" style={{ marginBottom: "1rem" }}>
            This permanently deletes your profile, activity history, and preferences. It
            can&apos;t be undone.
          </p>
          <div className="ds-row" style={{ gap: "0.75rem" }}>
            <Button type="button" variant="secondary" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              style={{ color: "var(--error)", borderColor: "var(--error)" }}
              onClick={handleDeleteAccount}
              disabled={deleting}
              loading={deleting}
            >
              Yes, permanently delete my account
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
