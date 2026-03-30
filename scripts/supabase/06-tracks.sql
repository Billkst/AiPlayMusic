create table tracks (
  id text primary key,
  source_type text not null check (source_type in ('self_hosted_open', 'licensed_partner', 'external_reference')),
  source_key text,
  name text not null,
  artist text not null,
  album text,
  cover_url text,
  audio_url text,
  preview_url text,
  external_url text,
  playback_mode text not null check (playback_mode in ('direct_play', 'preview_only', 'external_jump', 'unavailable')),
  license_type text check (license_type in ('CC0', 'CC_BY', 'commercial_partner', 'metadata_only', 'other')),
  attribution_text text,
  duration int,
  genre_tags text[],
  mood_tags text[],
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table tracks enable row level security;

create policy "Anyone can view active tracks"
  on tracks for select
  using (is_active = true);

create policy "Admins can manage tracks"
  on tracks for all
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
