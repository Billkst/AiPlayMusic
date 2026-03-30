-- 2. anonymous_sessions 表
create table anonymous_sessions (
  id uuid primary key default gen_random_uuid(),
  session_token text unique not null,
  device_fingerprint_hash text,
  guest_quota_used int default 0,
  guest_quota_limit int default 10,
  promoted_to_user_id uuid references auth.users,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table anonymous_sessions enable row level security;

create policy "Service role only"
  on anonymous_sessions for all
  to service_role
  using (true)
  with check (true);
