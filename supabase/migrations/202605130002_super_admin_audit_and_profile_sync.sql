-- Super Admin hardening: profile consistency, auth email sync, and admin audit logs.
-- Safe to run multiple times.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles alter column role set default 'admin';
alter table public.profiles alter column plan set default 'starter';
alter table public.profiles alter column subscription_status set default 'active';

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_logs enable row level security;

drop policy if exists "Super admins can read admin audit logs" on public.admin_audit_logs;
create policy "Super admins can read admin audit logs"
  on public.admin_audit_logs for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    agency_name,
    phone,
    avatar_url,
    role,
    plan,
    subscription_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'agency_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'avatar_url',
    'admin',
    'starter',
    'active'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        agency_name = coalesce(public.profiles.agency_name, excluded.agency_name),
        phone = coalesce(public.profiles.phone, excluded.phone),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
        updated_at = now();

  insert into public.subscriptions (
    user_id,
    plan,
    status,
    billing_cycle,
    ai_limit,
    ai_used
  )
  values (
    new.id,
    'starter',
    'active',
    'monthly',
    20,
    0
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_auth_user_profile();

drop trigger if exists on_auth_user_updated_profile on auth.users;
create trigger on_auth_user_updated_profile
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_auth_user_profile();

insert into public.profiles (id, email, full_name, avatar_url, role, plan, subscription_status)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data->>'full_name', users.raw_user_meta_data->>'name'),
  users.raw_user_meta_data->>'avatar_url',
  'admin',
  'starter',
  'active'
from auth.users users
on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

insert into public.subscriptions (user_id, plan, status, billing_cycle, ai_limit, ai_used)
select users.id, 'starter', 'active', 'monthly', 20, 0
from auth.users users
on conflict (user_id) do nothing;
