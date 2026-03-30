-- 3. admin_roles 表
create table admin_roles (
  user_id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('admin', 'operator')),
  granted_by uuid references auth.users,
  created_at timestamptz default now()
);

alter table admin_roles enable row level security;

create policy "Admins can view roles"
  on admin_roles for select
  to authenticated
  using (
    exists (
      select 1 from admin_roles
      where user_id = (select auth.uid())
    )
  );
