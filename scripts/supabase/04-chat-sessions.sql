create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null check (owner_type in ('anonymous', 'user')),
  anonymous_session_id uuid references anonymous_sessions,
  user_id uuid references auth.users,
  title text,
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table chat_sessions enable row level security;

create policy "Users can view own sessions"
  on chat_sessions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Service can manage all sessions"
  on chat_sessions for all
  to service_role
  using (true)
  with check (true);
