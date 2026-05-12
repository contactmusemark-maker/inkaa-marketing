-- Align Supabase schema with columns referenced by the Inkaa application.
-- Safe to run multiple times.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_name text,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'admin',
  plan text default 'starter',
  subscription_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null,
  company text not null,
  industry text not null,
  email text not null,
  phone text not null,
  manager text not null,
  mrr numeric not null default 0,
  projects integer not null default 0,
  status text not null default 'Active',
  plan text not null default 'starter',
  last_contact date,
  joined_date date not null default current_date,
  tags text[] not null default '{}',
  city text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  provider text not null,
  model text not null,
  generation_type text,
  prompt text not null,
  response text not null,
  response_length integer not null default 0,
  tokens_used integer not null default 0,
  total_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool text not null,
  provider text not null,
  model text not null,
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
  actor_role text not null,
  action text not null,
  target_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists agency_name text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists role text not null default 'admin';
alter table public.profiles add column if not exists plan text default 'starter';
alter table public.profiles add column if not exists subscription_status text not null default 'active';
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
alter table public.profiles alter column role set default 'admin';
alter table public.profiles alter column plan set default 'starter';
alter table public.profiles alter column subscription_status set default 'active';

alter table public.clients add column if not exists owner_id uuid references auth.users(id) on delete cascade;
alter table public.clients add column if not exists contact_name text;
alter table public.clients add column if not exists company text;
alter table public.clients add column if not exists industry text;
alter table public.clients add column if not exists email text;
alter table public.clients add column if not exists phone text;
alter table public.clients add column if not exists manager text;
alter table public.clients add column if not exists mrr numeric not null default 0;
alter table public.clients add column if not exists projects integer not null default 0;
alter table public.clients add column if not exists status text not null default 'Active';
alter table public.clients add column if not exists plan text not null default 'starter';
alter table public.clients add column if not exists last_contact date;
alter table public.clients add column if not exists joined_date date not null default current_date;
alter table public.clients add column if not exists tags text[] not null default '{}';
alter table public.clients add column if not exists city text;
alter table public.clients add column if not exists created_at timestamptz not null default now();
alter table public.clients add column if not exists updated_at timestamptz not null default now();

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

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'manager', 'member', 'client', 'Owner'));

alter table public.ai_generations add column if not exists tool text;
alter table public.ai_generations add column if not exists provider text;
alter table public.ai_generations add column if not exists model text;
alter table public.ai_generations add column if not exists generation_type text;
alter table public.ai_generations add column if not exists prompt text;
alter table public.ai_generations add column if not exists response text;
alter table public.ai_generations add column if not exists response_length integer not null default 0;
alter table public.ai_generations add column if not exists tokens_used integer not null default 0;
alter table public.ai_generations add column if not exists total_tokens integer not null default 0;
alter table public.ai_generations add column if not exists created_at timestamptz not null default now();

alter table public.ai_usage_logs add column if not exists tool text;
alter table public.ai_usage_logs add column if not exists provider text;
alter table public.ai_usage_logs add column if not exists model text;
alter table public.ai_usage_logs add column if not exists generation_type text;
alter table public.ai_usage_logs add column if not exists prompt text;
alter table public.ai_usage_logs add column if not exists response_length integer not null default 0;
alter table public.ai_usage_logs add column if not exists tokens_used integer not null default 0;
alter table public.ai_usage_logs add column if not exists total_tokens integer not null default 0;
alter table public.ai_usage_logs add column if not exists created_at timestamptz not null default now();

alter table public.admin_audit_logs add column if not exists actor_id uuid references auth.users(id) on delete set null;
alter table public.admin_audit_logs add column if not exists actor_role text not null default 'super_admin';
alter table public.admin_audit_logs add column if not exists action text;
alter table public.admin_audit_logs add column if not exists target_user_id uuid references auth.users(id) on delete set null;
alter table public.admin_audit_logs add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.admin_audit_logs add column if not exists ip_address text;
alter table public.admin_audit_logs add column if not exists user_agent text;
alter table public.admin_audit_logs add column if not exists created_at timestamptz not null default now();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_generations enable row level security;
alter table public.ai_usage_logs enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can read own clients" on public.clients;
create policy "Users can read own clients"
  on public.clients for select
  using (auth.uid() = owner_id);

drop policy if exists "Users can insert own clients" on public.clients;
create policy "Users can insert own clients"
  on public.clients for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update own clients" on public.clients;
create policy "Users can update own clients"
  on public.clients for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete own clients" on public.clients;
create policy "Users can delete own clients"
  on public.clients for delete
  using (auth.uid() = owner_id);

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

drop policy if exists "Users can read own ai generations" on public.ai_generations;
create policy "Users can read own ai generations"
  on public.ai_generations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own ai generations" on public.ai_generations;
create policy "Users can insert own ai generations"
  on public.ai_generations for insert
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
      ('profiles', 'agency_name'),
      ('profiles', 'full_name'),
      ('profiles', 'email'),
      ('profiles', 'phone'),
      ('profiles', 'avatar_url'),
      ('profiles', 'role'),
      ('profiles', 'plan'),
      ('profiles', 'subscription_status'),
      ('profiles', 'created_at'),
      ('profiles', 'updated_at'),
      ('clients', 'id'),
      ('clients', 'owner_id'),
      ('clients', 'contact_name'),
      ('clients', 'company'),
      ('clients', 'industry'),
      ('clients', 'email'),
      ('clients', 'phone'),
      ('clients', 'manager'),
      ('clients', 'mrr'),
      ('clients', 'projects'),
      ('clients', 'status'),
      ('clients', 'plan'),
      ('clients', 'last_contact'),
      ('clients', 'joined_date'),
      ('clients', 'tags'),
      ('clients', 'city'),
      ('clients', 'created_at'),
      ('clients', 'updated_at'),
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
      ('ai_generations', 'id'),
      ('ai_generations', 'user_id'),
      ('ai_generations', 'tool'),
      ('ai_generations', 'provider'),
      ('ai_generations', 'model'),
      ('ai_generations', 'generation_type'),
      ('ai_generations', 'prompt'),
      ('ai_generations', 'response'),
      ('ai_generations', 'response_length'),
      ('ai_generations', 'tokens_used'),
      ('ai_generations', 'total_tokens'),
      ('ai_generations', 'created_at'),
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
  )
  select required.req_table, required.req_column
  from required
  left join information_schema.columns cols
    on cols.table_schema = 'public'
    and cols.table_name = required.req_table
    and cols.column_name = required.req_column
  where cols.column_name is null;
$$;

grant execute on function public.validate_inkaa_schema() to authenticated;
grant execute on function public.validate_inkaa_schema() to service_role;
