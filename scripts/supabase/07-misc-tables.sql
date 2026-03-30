create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  track_id text references tracks not null,
  created_at timestamptz default now(),
  unique(user_id, track_id)
);

alter table favorites enable row level security;

create policy "Users can manage own favorites"
  on favorites for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table app_settings (
  key text primary key,
  value_json jsonb not null,
  updated_by uuid references auth.users,
  updated_at timestamptz default now()
);

alter table app_settings enable row level security;

create policy "Admins can manage settings"
  on app_settings for all
  to authenticated
  using (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  );
