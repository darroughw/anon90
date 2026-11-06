-- ANO-7 Push reminders: replace the email reminder channel with push notifications.
-- `reminder_email_enabled` becomes `reminder_push_enabled` (rename, not drop+add, so
-- existing per-user preference values survive) and device_tokens stores the APNs
-- tokens the cron job sends to.
alter table profiles
  rename column reminder_email_enabled to reminder_push_enabled;

create table if not exists device_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  token text not null,
  platform text not null default 'ios',
  created_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table device_tokens enable row level security;

create policy "Users manage their own device tokens"
  on device_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
