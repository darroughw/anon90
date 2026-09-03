-- Mirrors profiles.has_sponsor: same "do you have X" recovery-program
-- affiliation pattern, asked at onboarding, editable from the profile.
alter table profiles
  add column if not exists has_service_position boolean not null default false,
  add column if not exists has_homegroup boolean not null default false;
