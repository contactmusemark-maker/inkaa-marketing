-- Inkaa live database schema for Supabase.
-- Run this in Supabase SQL Editor before using the live auth/client flows.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  agency_name text,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'admin',
  plan text default 'starter',
  subscription_status text not null default 'trial',
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
  status text not null default 'trial',
  billing_cycle text not null default 'monthly',
  ai_limit integer default 20,
  ai_used integer not null default 0,
  current_period_start timestamptz not null default date_trunc('month', now()),
  current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month'),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  next_billing_at timestamptz,
  cancel_at timestamptz,
  razorpay_customer_id text,
  razorpay_plan_id text,
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

create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null,
  billing_cycle text not null default 'monthly',
  amount integer not null default 0,
  currency text not null default 'INR',
  status text not null default 'created',
  razorpay_subscription_id text,
  razorpay_payment_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number text not null unique,
  plan text not null,
  billing_cycle text not null default 'monthly',
  amount integer not null default 0,
  currency text not null default 'INR',
  status text not null default 'created',
  razorpay_payment_id text,
  invoice_url text,
  issued_at timestamptz not null default now(),
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

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

create unique index if not exists subscription_payments_razorpay_payment_id_key
  on public.subscription_payments(razorpay_payment_id)
  where razorpay_payment_id is not null;

alter table public.subscriptions add column if not exists billing_cycle text not null default 'monthly';
alter table public.subscriptions add column if not exists ai_limit integer default 20;
alter table public.subscriptions add column if not exists ai_used integer not null default 0;
alter table public.subscriptions add column if not exists current_period_start timestamptz not null default date_trunc('month', now());
alter table public.subscriptions add column if not exists current_period_end timestamptz not null default (date_trunc('month', now()) + interval '1 month');
alter table public.subscriptions add column if not exists trial_started_at timestamptz;
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;
alter table public.subscriptions add column if not exists next_billing_at timestamptz;
alter table public.subscriptions add column if not exists cancel_at timestamptz;
alter table public.subscriptions add column if not exists razorpay_customer_id text;
alter table public.subscriptions add column if not exists razorpay_plan_id text;
alter table public.subscriptions add column if not exists razorpay_subscription_id text;
alter table public.subscriptions add column if not exists razorpay_payment_id text;
alter table public.profiles alter column role set default 'admin';
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles alter column plan set default 'starter';
alter table public.profiles alter column subscription_status set default 'trial';
alter table public.subscriptions alter column plan set default 'starter';
alter table public.subscriptions alter column status set default 'trial';
alter table public.subscriptions alter column billing_cycle set default 'monthly';
alter table public.subscriptions alter column ai_limit set default 20;
alter table public.subscriptions alter column ai_used set default 0;
create unique index if not exists subscriptions_user_id_key on public.subscriptions(user_id);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'manager', 'member', 'client', 'Owner'));

alter table public.ai_generations add column if not exists generation_type text;
alter table public.ai_generations add column if not exists response_length integer not null default 0;
alter table public.ai_generations add column if not exists tokens_used integer not null default 0;
alter table public.ai_usage_logs add column if not exists generation_type text;
alter table public.ai_usage_logs add column if not exists prompt text;
alter table public.ai_usage_logs add column if not exists response_length integer not null default 0;
alter table public.ai_usage_logs add column if not exists tokens_used integer not null default 0;

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
alter table public.subscription_payments enable row level security;
alter table public.billing_invoices enable row level security;
alter table public.feedback_submissions enable row level security;
alter table public.support_tickets enable row level security;

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

drop policy if exists "Users can read own subscription payments" on public.subscription_payments;
create policy "Users can read own subscription payments"
  on public.subscription_payments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own billing invoices" on public.billing_invoices;
create policy "Users can read own billing invoices"
  on public.billing_invoices for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own support tickets" on public.support_tickets;
create policy "Users can insert own support tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own support tickets" on public.support_tickets;
create policy "Users can read own support tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

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
      ('subscriptions', 'trial_started_at'),
      ('subscriptions', 'trial_ends_at'),
      ('subscriptions', 'next_billing_at'),
      ('subscriptions', 'cancel_at'),
      ('subscriptions', 'razorpay_customer_id'),
      ('subscriptions', 'razorpay_plan_id'),
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
      ('admin_audit_logs', 'created_at'),
      ('subscription_payments', 'id'),
      ('subscription_payments', 'user_id'),
      ('subscription_payments', 'plan'),
      ('subscription_payments', 'billing_cycle'),
      ('subscription_payments', 'amount'),
      ('subscription_payments', 'currency'),
      ('subscription_payments', 'status'),
      ('subscription_payments', 'razorpay_subscription_id'),
      ('subscription_payments', 'razorpay_payment_id'),
      ('subscription_payments', 'paid_at'),
      ('subscription_payments', 'created_at'),
      ('billing_invoices', 'id'),
      ('billing_invoices', 'user_id'),
      ('billing_invoices', 'invoice_number'),
      ('billing_invoices', 'plan'),
      ('billing_invoices', 'billing_cycle'),
      ('billing_invoices', 'amount'),
      ('billing_invoices', 'currency'),
      ('billing_invoices', 'status'),
      ('billing_invoices', 'razorpay_payment_id'),
      ('billing_invoices', 'invoice_url'),
      ('billing_invoices', 'issued_at'),
      ('billing_invoices', 'due_at'),
      ('billing_invoices', 'paid_at'),
      ('billing_invoices', 'created_at'),
      ('feedback_submissions', 'id'),
      ('feedback_submissions', 'user_id'),
      ('feedback_submissions', 'name'),
      ('feedback_submissions', 'email'),
      ('feedback_submissions', 'category'),
      ('feedback_submissions', 'message'),
      ('feedback_submissions', 'screenshot_path'),
      ('feedback_submissions', 'created_at'),
      ('support_tickets', 'id'),
      ('support_tickets', 'user_id'),
      ('support_tickets', 'name'),
      ('support_tickets', 'email'),
      ('support_tickets', 'category'),
      ('support_tickets', 'priority'),
      ('support_tickets', 'subject'),
      ('support_tickets', 'message'),
      ('support_tickets', 'status'),
      ('support_tickets', 'page_url'),
      ('support_tickets', 'browser_info'),
      ('support_tickets', 'device_info'),
      ('support_tickets', 'screenshot_path'),
      ('support_tickets', 'internal_reply'),
      ('support_tickets', 'replied_by'),
      ('support_tickets', 'replied_at'),
      ('support_tickets', 'resolved_at'),
      ('support_tickets', 'created_at'),
      ('support_tickets', 'updated_at')
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

create or replace function public.handle_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  trial_start timestamptz := now();
  trial_end timestamptz := now() + interval '14 days';
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
    'trial'
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
    ai_used,
    trial_started_at,
    trial_ends_at,
    current_period_start,
    current_period_end
  )
  values (
    new.id,
    'starter',
    'trial',
    'monthly',
    20,
    0,
    trial_start,
    trial_end,
    trial_start,
    trial_end
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
