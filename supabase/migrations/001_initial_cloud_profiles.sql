-- Level Up RPG cloud profile foundation.
-- Run this migration in Supabase SQL Editor before enabling cloud accounts.

create table if not exists public.player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_number smallint not null check (profile_number between 1 and 3),
  display_name text not null default 'Player',
  parent_verified boolean not null default false,
  cosmetics jsonb not null default '{}'::jsonb,
  progression jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, profile_number)
);

-- `stats` is a per-profile snapshot (streaks, challenge counts, boss
-- discoveries, and achievement inputs). It is intentionally persisted with
-- progression so local and cloud profiles stay isolated. Combat and stat
-- events are currently client-side; this snapshot is not server-authoritative
-- until a trusted event/RPC boundary is added for combat outcomes.

alter table public.player_profiles enable row level security;

create policy "Users can read their own profiles"
  on public.player_profiles for select
  using (auth.uid() = user_id);

create policy "Users can create their own profiles"
  on public.player_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile metadata"
  on public.player_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.touch_player_profile()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists player_profiles_updated_at on public.player_profiles;
create trigger player_profiles_updated_at
before update on public.player_profiles
for each row execute function public.touch_player_profile();

-- This RPC is the first server-validated progression boundary.
-- The client submits an event, never an arbitrary level or XP value.
create or replace function public.record_progression_event(
  p_profile_id uuid,
  p_skill_id text,
  p_event_type text,
  p_xp integer default 0,
  p_metadata jsonb default '{}'::jsonb
)
returns public.player_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.player_profiles;
  next_progression jsonb;
  skill_state jsonb;
  next_xp integer;
  next_level integer;
begin
  select * into current_profile
  from public.player_profiles
  where id = p_profile_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if p_event_type not in ('challenge_completed', 'battle_won', 'battle_lost') then
    raise exception 'Unsupported progression event';
  end if;

  skill_state := coalesce(current_profile.progression -> p_skill_id, '{"level":1,"xp":0}'::jsonb);
  next_xp := greatest(0, coalesce((skill_state ->> 'xp')::integer, 0) + greatest(0, least(p_xp, 1000)));
  next_level := greatest(1, coalesce((skill_state ->> 'level')::integer, 1) + (next_xp / 100));
  next_progression := jsonb_set(
    current_profile.progression,
    array[p_skill_id],
    skill_state || jsonb_build_object('xp', next_xp % 100, 'level', next_level, 'lastEvent', p_event_type, 'lastEventAt', now(), 'metadata', p_metadata),
    true
  );

  update public.player_profiles
  set progression = next_progression
  where id = p_profile_id
  returning * into current_profile;

  return current_profile;
end;
$$;

revoke all on function public.record_progression_event(uuid, text, text, integer, jsonb) from public;
grant execute on function public.record_progression_event(uuid, text, text, integer, jsonb) to authenticated;
