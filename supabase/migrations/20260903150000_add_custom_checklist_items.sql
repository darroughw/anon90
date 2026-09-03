-- Checklist items become per-user and editable (previously 7 fixed
-- columns on daily_entries). Existing behavior is preserved as the
-- starting *suggestions*, not a hardcoded list.
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

alter table checklist_items enable row level security;

create policy "Users manage their own checklist items"
  on checklist_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Per-day completion, one row per (user, date, item) that's been checked.
-- Absence of a row means "not completed" -- mirrors how the old boolean
-- columns worked, just normalized instead of fixed-width.
create table if not exists daily_entry_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  checklist_item_id uuid not null references checklist_items(id) on delete cascade,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date, checklist_item_id)
);

alter table daily_entry_completions enable row level security;

create policy "Users manage their own completions"
  on daily_entry_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Seed every existing profile with the same 7 items the app already
-- showed everyone, as their starting suggestions (editable from here on).
insert into checklist_items (user_id, label, sort_order)
select p.id, v.label, v.sort_order
from profiles p
cross join (values
  (0, 'Read literature'),
  (1, 'Pray or meditate (morning)'),
  (2, 'Call your sponsor'),
  (3, 'Call someone in the fellowship'),
  (4, 'Go to a meeting'),
  (5, 'Didn''t drink or use'),
  (6, 'Pray or meditate (evening)')
) as v(sort_order, label);

-- Backfill completions from the old fixed boolean columns so nobody's
-- streak/history resets because of this change.
insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Read literature'
where de.read_literature is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Pray or meditate (morning)'
where de.morning_reflection is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Call your sponsor'
where de.call_sponsor is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Call someone in the fellowship'
where de.call_fellowship is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Go to a meeting'
where de.attended_meeting is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Didn''t drink or use'
where de.stayed_sober is true
on conflict do nothing;

insert into daily_entry_completions (user_id, entry_date, checklist_item_id, completed)
select de.user_id, de.entry_date, ci.id, true
from daily_entries de
join checklist_items ci on ci.user_id = de.user_id and ci.label = 'Pray or meditate (evening)'
where de.evening_reflection is true
on conflict do nothing;
