-- ANO-5 Reminders: per-user timezone (needed to compute each user's local
-- day boundary from a server-side cron job, not just client-side) and
-- per-channel reminder toggles.
-- ANO-6 Email System: explicit opt-in flag for the marketing/subscriber
-- email category, kept separate from transactional sends.
alter table profiles
  add column if not exists timezone text not null default 'UTC',
  add column if not exists reminder_toast_enabled boolean not null default true,
  add column if not exists reminder_email_enabled boolean not null default true,
  add column if not exists marketing_emails_opt_in boolean not null default false;
