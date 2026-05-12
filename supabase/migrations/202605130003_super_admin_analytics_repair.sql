-- Super Admin analytics repair.
-- Run after 202605130001 and 202605130002.
-- Safe to run multiple times.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan text not null default 'starter',
  status text not null default 'active',
  billing_cycle text not null default 'monthly',
  ai_limit integer default 20,
  ai_used integer not null default 0,
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  razorpay_customer_id text,
  razorpay_subscription_id text,
  razorpay_payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null default 'unknown',
  provider text not null default 'unknown',
  model text not null default 'unknown',
  generation_type text,
  prompt text,
  response_length integer not null default 0,
  tokens_used integer not null default 0,
  total_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'super_admin',
  action text not null default 'admin.unknown',
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.subscriptions add column if not exists plan text not null default 'starter';
alter table public.subscriptions add column if not exists status text not null default 'active';
alter table public.subscriptions add column if not exists billing_cycle text not null default 'monthly';
alter table public.subscriptions add column if not exists ai_limit integer default 20;
alter table public.subscriptions add column if not exists ai_used integer not null default 0;
alter table public.subscriptions add column if not exists current_period_start timestamptz not null default date_trunc('month', now());
alter table public.subscriptions add column if not exists current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month');
alter table public.subscriptions add column if not exists razorpay_customer_id text;
alter table public.subscriptions add column if not exists razorpay_subscription_id text;
alter table public.subscriptions add column if not exists razorpay_payment_id text;
alter table public.subscriptions add column if not exists created_at timestamptz not null default now();
alter table public.subscriptions add column if not exists updated_at timestamptz not null default now();
alter table public.subscriptions alter column plan set default 'starter';
alter table public.subscriptions alter column status set default 'active';
alter table public.subscriptions alter column billing_cycle set default 'monthly';
alter table public.subscriptions alter column ai_limit set default 20;
alter table public.subscriptions alter column ai_used set default 0;
create unique index if not exists subscriptions_user_id_key on public.subscriptions(user_id);

alter table public.ai_usage_logs add column if not exists tool text;
alter table public.ai_usage_logs add column if not exists provider text;
alter table public.ai_usage_logs add column if not exists model text;
alter table public.ai_usage_logs add column if not exists generation_type text;
alter table public.ai_usage_logs add column if not exists prompt text;
alter table public.ai_usage_logs add column if not exists response_length integer not null default 0;
alter table public.ai_usage_logs add column if not exists tokens_used integer not null default 0;
alter table public.ai_usage_logs add column if not exists total_tokens integer not null default 0;
alter table public.ai_usage_logs add column if not exists created_at timestamptz not null default now();
update public.ai_usage_logs
set tool = coalesce(tool, 'unknown'),
    provider = coalesce(provider, 'unknown'),
    model = coalesce(model, 'unknown');
alter table public.ai_usage_logs alter column tool set default 'unknown';
alter table public.ai_usage_logs alter column provider set default 'unknown';
alter table public.ai_usage_logs alter column model set default 'unknown';
alter table public.ai_usage_logs alter column tool set not null;
alter table public.ai_usage_logs alter column provider set not null;
alter table public.ai_usage_logs alter column model set not null;

alter table public.admin_audit_logs add column if not exists actor_id uuid references auth.users(id) on delete set null;
alter table public.admin_audit_logs add column if not exists actor_role text not null default 'super_admin';
alter table public.admin_audit_logs add column if not exists action text;
alter table public.admin_audit_logs add column if not exists target_user_id uuid references auth.users(id) on delete set null;
alter table public.admin_audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.admin_audit_logs add column if not exists ip_address text;
alter table public.admin_audit_logs add column if not exists user_agent text;
alter table public.admin_audit_logs add column if not exists created_at timestamptz not null default now();
update public.admin_audit_logs
set actor_role = coalesce(actor_role, 'super_admin'),
    action = coalesce(action, 'admin.unknown'),
    metadata = coalesce(metadata, '{}'::jsonb);
alter table public.admin_audit_logs alter column actor_role set default 'super_admin';
alter table public.admin_audit_logs alter column action set default 'admin.unknown';
alter table public.admin_audit_logs alter column actor_role set not null;
alter table public.admin_audit_logs alter column action set not null;
alter table public.admin_audit_logs alter column metadata set not null;

alter table public.subscriptions enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own subscription" on public.subscriptions;
create policy "Users can insert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own subscription" on public.subscriptions;
create policy "Users can update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own ai usage logs" on public.ai_usage_logs;
create policy "Users can read own ai usage logs"
  on public.ai_usage_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai usage logs" on public.ai_usage_logs;
create policy "Users can insert own ai usage logs"
  on public.ai_usage_logs for insert
  with check (auth.uid() = user_id);

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

insert into public.subscriptions (user_id, plan, status, billing_cycle, ai_limit, ai_used)
select users.id, 'starter', 'active', 'monthly', 20, 0
from auth.users users
on conflict (user_id) do nothing;

create or replace function public.validate_inkaa_schema()
returns table(missing_table text, missing_column text)
language sql
stable
security definer
set search_path = public
as $$
  with required(req_table, req_column) as (
    values
      ('profiles', 'id'),
      ('profiles', 'email'),
      ('profiles', 'full_name'),
      ('profiles', 'agency_name'),
      ('profiles', 'avatar_url'),
      ('profiles', 'role'),
      ('profiles', 'plan'),
      ('profiles', 'subscription_status'),
      ('subscriptions', 'id'),
      ('subscriptions', 'user_id'),
      ('subscriptions', 'plan'),
      ('subscriptions', 'status'),
      ('subscriptions', 'billing_cycle'),
      ('subscriptions', 'ai_limit'),
      ('subscriptions', 'ai_used'),
      ('subscriptions', 'current_period_start'),
      ('subscriptions', 'current_period_end'),
      ('subscriptions', 'razorpay_customer_id'),
      ('subscriptions', 'razorpay_subscription_id'),
      ('subscriptions', 'razorpay_payment_id'),
      ('subscriptions', 'created_at'),
      ('subscriptions', 'updated_at'),
      ('ai_usage_logs', 'id'),
      ('ai_usage_logs', 'user_id'),
      ('ai_usage_logs', 'tool'),
      ('ai_usage_logs', 'provider'),
      ('ai_usage_logs', 'model'),
      ('ai_usage_logs', 'generation_type'),
      ('ai_usage_logs', 'prompt'),
      ('ai_usage_logs', 'response_length'),
      ('ai_usage_logs', 'tokens_used'),
      ('ai_usage_logs', 'total_tokens'),
      ('ai_usage_logs', 'created_at'),
      ('admin_audit_logs', 'id'),
      ('admin_audit_logs', 'actor_id'),
      ('admin_audit_logs', 'actor_role'),
      ('admin_audit_logs', 'action'),
      ('admin_audit_logs', 'target_user_id'),
      ('admin_audit_logs', 'metadata'),
      ('admin_audit_logs', 'ip_address'),
      ('admin_audit_logs', 'user_agent'),
      ('admin_audit_logs', 'created_at')
  ),
  missing_columns as (
    select required.req_table, required.req_column
    from required
    left join information_schema.columns cols
      on cols.table_schema = 'public'
      and cols.table_name = required.req_table
      and cols.column_name = required.req_column
    where cols.column_name is null
  ),
  required_policies(req_table, req_policy) as (
    values
      ('subscriptions', 'Users can read own subscription'),
      ('subscriptions', 'Users can insert own subscription'),
      ('subscriptions', 'Users can update own subscription'),
      ('ai_usage_logs', 'Users can read own ai usage logs'),
      ('ai_usage_logs', 'Users can insert own ai usage logs'),
      ('admin_audit_logs', 'Super admins can read admin audit logs')
  ),
  missing_policies as (
    select '_policy'::text as req_table, concat(req_table, ':', req_policy) as req_column
    from required_policies
    where not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = required_policies.req_table
        and policyname = required_policies.req_policy
    )
  ),
  missing_functions as (
    select '_function'::text as req_table, 'public.handle_auth_user_profile()'::text as req_column
    where to_regprocedure('public.handle_auth_user_profile()') is null
  ),
  missing_triggers as (
    select '_trigger'::text as req_table, 'auth.users:on_auth_user_created_profile'::text as req_column
    where not exists (
      select 1
      from pg_trigger
      where tgname = 'on_auth_user_created_profile'
        and tgrelid = 'auth.users'::regclass
        and not tgisinternal
    )
    union all
    select '_trigger'::text, 'auth.users:on_auth_user_updated_profile'::text
    where not exists (
      select 1
      from pg_trigger
      where tgname = 'on_auth_user_updated_profile'
        and tgrelid = 'auth.users'::regclass
        and not tgisinternal
    )
  )
  select * from missing_columns
  union all
  select * from missing_policies
  union all
  select * from missing_functions
  union all
  select * from missing_triggers;
$$;

grant execute on function public.validate_inkaa_schema() to authenticated;
grant execute on function public.validate_inkaa_schema() to service_role;
