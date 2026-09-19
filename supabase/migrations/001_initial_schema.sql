-- AI Factory — Phase 1 Schema
-- Run in Supabase SQL Editor: https://app.supabase.com/project/<id>/sql/new

create extension if not exists "pgcrypto";

create type project_category as enum ('Enterprise','Education','Business','Coding','Personal','Custom');
create type project_provider as enum ('ChatGPT','Claude','Gemini','DeepSeek','Kimi','OpenRouter','Other');
create type deployment_target as enum ('Supabase','Vercel','Railway','Cloud Run','Docker','Local');
create type project_status as enum ('Idea','Development','Testing','Production');

create table if not exists public.projects (
  id                uuid              primary key default gen_random_uuid(),
  name              text              not null check (char_length(name) >= 2 and char_length(name) <= 200),
  description       text,
  category          project_category  not null default 'Enterprise',
  provider          project_provider  not null default 'Claude',
  deployment_target deployment_target not null default 'Vercel',
  status            project_status    not null default 'Idea',
  version           text              not null default '1.0.0' check (version ~ '^\d+\.\d+\.\d+$'),
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now()
);

create index if not exists projects_status_idx     on public.projects (status);
create index if not exists projects_updated_at_idx on public.projects (updated_at desc);

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

alter table public.projects enable row level security;
create policy "Allow all" on public.projects for all using (true) with check (true);

-- Seed data (remove in production)
insert into public.projects (name, description, category, provider, deployment_target, status, version) values
  ('Customer Support Agent', 'Automates tier-1 support tickets using RAG.', 'Enterprise', 'Claude',     'Vercel',    'Production',  '2.1.0'),
  ('Code Review Assistant',  'Reviews PRs and suggests improvements.',      'Coding',     'ChatGPT',    'Railway',   'Testing',     '1.3.0'),
  ('Internal Q&A Bot',       'Answers questions about internal SOPs.',       'Business',   'Gemini',     'Cloud Run', 'Development', '1.0.0'),
  ('Math Tutor',             'Step-by-step solver for K-12 students.',       'Education',  'Claude',     'Vercel',    'Idea',        '0.1.0'),
  ('Journal Analyzer',       'Analyzes entries for mood trends.',            'Personal',   'OpenRouter', 'Local',     'Development', '1.1.0');
