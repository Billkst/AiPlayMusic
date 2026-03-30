create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_session_id uuid references chat_sessions on delete cascade not null,
  role text not null check (role in ('system', 'user', 'assistant')),
  content text not null,
  metadata_json jsonb,
  created_at timestamptz default now()
);

alter table chat_messages enable row level security;

create policy "Users can view messages in own sessions"
  on chat_messages for select
  to authenticated
  using (
    exists (
      select 1 from chat_sessions
      where id = chat_session_id
      and user_id = (select auth.uid())
    )
  );

create policy "Service can manage all messages"
  on chat_messages for all
  to service_role
  using (true)
  with check (true);
