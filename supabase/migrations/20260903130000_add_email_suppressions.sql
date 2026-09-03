-- Suppression list for marketing/subscriber email recipients who don't
-- have a Supabase account (e.g. the pre-launch Google Sheets waitlist) --
-- profiles.marketing_emails_opt_in handles registered users, this table
-- is the equivalent for everyone else. Checked before any bulk/campaign
-- send; written to by /unsubscribe when the signed token's subject is an
-- email address rather than a user id.
create table if not exists email_suppressions (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table email_suppressions enable row level security;
-- No policies: only ever touched via the service-role admin client
-- (lib/supabase/admin.ts), never from a user-scoped session.
