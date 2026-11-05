-- ═══════════════════════════════════════════════════════════════════
-- Nova AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ═══════════════════════════════════════════════════════════════════

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── users ───────────────────────────────────────────────────────────────────
-- Extends Supabase Auth — one row per authenticated user
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  name          text,
  avatar_url    text,
  is_guest      boolean not null default false,
  settings      jsonb   not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own row"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own row"
  on public.users for insert
  with check (auth.uid() = id);

-- ─── conversations ────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null default 'New conversation',
  model      text not null default 'openai/gpt-oss-120b',
  pinned     boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conv_user   on public.conversations(user_id);
create index if not exists idx_conv_updated on public.conversations(updated_at desc);

alter table public.conversations enable row level security;

create policy "Users manage own conversations"
  on public.conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── messages ─────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user','assistant','system')),
  content         text not null default '',
  feedback        text check (feedback in ('up','down')),
  created_at      timestamptz not null default now()
);

create index if not exists idx_msg_conv on public.messages(conversation_id);
create index if not exists idx_msg_created on public.messages(created_at);

alter table public.messages enable row level security;

create policy "Users manage own messages"
  on public.messages for all
  using (
    auth.uid() = (
      select user_id from public.conversations
      where id = conversation_id
    )
  )
  with check (
    auth.uid() = (
      select user_id from public.conversations
      where id = conversation_id
    )
  );

-- ─── memories ─────────────────────────────────────────────────────────────────
create table if not exists public.memories (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  text       text not null,
  source     text not null default 'manual' check (source in ('manual','auto')),
  created_at timestamptz not null default now()
);

create index if not exists idx_mem_user on public.memories(user_id);

alter table public.memories enable row level security;

create policy "Users manage own memories"
  on public.memories for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger trg_conv_updated
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- ─── Auto-create user row on sign-up ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
