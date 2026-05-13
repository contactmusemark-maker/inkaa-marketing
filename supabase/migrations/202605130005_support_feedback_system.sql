-- Customer support and feedback system.
-- Safe to run multiple times.

create table if not exists public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  category text not null,
  message text not null,
  screenshot_path text,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text,
  email text,
  category text not null default 'Bug Report',
  priority text not null default 'Medium',
  subject text not null,
  message text not null,
  status text not null default 'Open',
  page_url text,
  browser_info text,
  device_info text,
  screenshot_path text,
  internal_reply text,
  replied_by uuid references auth.users(id) on delete set null,
  replied_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.feedback_submissions add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.feedback_submissions add column if not exists screenshot_path text;
alter table public.support_tickets add column if not exists page_url text;
alter table public.support_tickets add column if not exists browser_info text;
alter table public.support_tickets add column if not exists device_info text;
alter table public.support_tickets add column if not exists screenshot_path text;
alter table public.support_tickets add column if not exists internal_reply text;
alter table public.support_tickets add column if not exists replied_by uuid references auth.users(id) on delete set null;
alter table public.support_tickets add column if not exists replied_at timestamptz;
alter table public.support_tickets add column if not exists resolved_at timestamptz;

alter table public.support_tickets drop constraint if exists support_tickets_status_check;
alter table public.support_tickets add constraint support_tickets_status_check
  check (status in ('Open', 'In Progress', 'Resolved', 'Closed'));

alter table public.support_tickets drop constraint if exists support_tickets_priority_check;
alter table public.support_tickets add constraint support_tickets_priority_check
  check (priority in ('Low', 'Medium', 'High', 'Urgent'));

create index if not exists support_tickets_status_created_idx
  on public.support_tickets(status, created_at desc);

create index if not exists feedback_submissions_created_idx
  on public.feedback_submissions(created_at desc);

alter table public.feedback_submissions enable row level security;
alter table public.support_tickets enable row level security;

drop policy if exists "Users can read own support tickets" on public.support_tickets;
create policy "Users can read own support tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own support tickets" on public.support_tickets;
create policy "Users can insert own support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can insert own feedback" on public.feedback_submissions;
create policy "Users can insert own feedback"
  on public.feedback_submissions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Super admins can manage support tickets" on public.support_tickets;
create policy "Super admins can manage support tickets"
  on public.support_tickets for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

drop policy if exists "Super admins can read feedback" on public.feedback_submissions;
create policy "Super admins can read feedback"
  on public.feedback_submissions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );
