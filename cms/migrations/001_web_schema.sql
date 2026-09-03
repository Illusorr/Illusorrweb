-- ILLUSORR website CMS — initial schema
--
-- Lives in its own `web` schema rather than `public`, because the project
-- already hosts an unrelated client review dashboard (cycles, comments,
-- signoffs, its own `submissions` and `profiles`). Separate schema means no
-- name collisions, its own RLS, and the website can be dropped in one
-- statement without touching client data.
--
-- Nothing here is applied automatically. Review, then apply.

create schema if not exists web;

-- ─────────────────────────────────────────────── form intake
create type web.form_kind   as enum ('brief', 'contact', 'collective');
create type web.lead_status as enum ('new', 'reading', 'replied', 'won', 'archived', 'spam');

create table web.form_submissions (
  id           uuid primary key default gen_random_uuid(),
  kind         web.form_kind   not null,
  status       web.lead_status not null default 'new',
  name         text,
  email        text,
  -- everything the form collected, verbatim, so a field added to a form later
  -- still lands somewhere without a migration
  payload      jsonb           not null default '{}'::jsonb,
  page         text,
  user_agent   text,
  notes        text,
  assigned_to  uuid references auth.users (id) on delete set null,
  created_at   timestamptz     not null default now(),
  updated_at   timestamptz     not null default now()
);
create index on web.form_submissions (kind, status, created_at desc);
create index on web.form_submissions (email);
create index on web.form_submissions using gin (payload);

-- ─────────────────────────────────────────────── the Collective
create table web.disciplines (
  id       uuid primary key default gen_random_uuid(),
  name     text not null unique,     -- must match the name used on the site
  tools    text,
  note     text,
  position int  not null default 0
);

create type web.commission_status as enum ('open', 'filling', 'closed');

create table web.commissions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  discipline  text not null references web.disciplines (name) on update cascade,
  status      web.commission_status not null default 'open',
  detail      text,
  territory   text,
  position    int  not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table web.collective_members (
  id            uuid primary key default gen_random_uuid(),
  -- set when a member is promoted out of the applications inbox
  submission_id uuid references web.form_submissions (id) on delete set null,
  name          text not null,
  email         text,
  discipline    text references web.disciplines (name) on update cascade,
  level         text,
  location      text,
  territory     text,
  links         text,
  tools         text,
  available     boolean not null default true,
  published     boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ─────────────────────────────────────────────── projects and team
create table web.projects (
  slug        text primary key,       -- matches projects/<slug>.html and the asset folder
  title       text not null,
  client      text,
  sector      text,
  year        int,
  tags        text[] not null default '{}',
  cover       text,                   -- assets/img/projects/<slug>/cover.webp
  summary     text,
  in_grid     boolean not null default true,
  published   boolean not null default true,
  position    int     not null default 0,
  updated_at  timestamptz not null default now()
);

create table web.team (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  bio        text,
  photo      text,
  links      jsonb not null default '{}'::jsonb,
  position   int  not null default 0,
  published  boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────── touch updated_at
create or replace function web.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger t_forms_touch before update on web.form_submissions
  for each row execute function web.touch_updated_at();
create trigger t_projects_touch before update on web.projects
  for each row execute function web.touch_updated_at();
