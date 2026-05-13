-- Production subscription lifecycle: 14-day trials, Razorpay recurring billing,
-- payment history, generated invoices, and expiry-aware status fields.
-- Safe to run multiple times.

alter table public.profiles alter column subscription_status set default 'trial';

alter table public.subscriptions add column if not exists trial_started_at timestamptz;
alter table public.subscriptions add column if not exists trial_ends_at timestamptz;
alter table public.subscriptions add column if not exists next_billing_at timestamptz;
alter table public.subscriptions add column if not exists cancel_at timestamptz;
alter table public.subscriptions add column if not exists razorpay_plan_id text;
alter table public.subscriptions alter column status set default 'trial';

update public.subscriptions
set
  status = case when status = 'active' and razorpay_subscription_id is null then 'trial' else status end,
  trial_started_at = coalesce(trial_started_at, created_at, now()),
  trial_ends_at = coalesce(trial_ends_at, coalesce(created_at, now()) + interval '14 days'),
  current_period_start = coalesce(current_period_start, created_at, now()),
  current_period_end = coalesce(current_period_end, coalesce(created_at, now()) + interval '14 days')
where trial_ends_at is null
   or trial_started_at is null;

update public.profiles
set subscription_status = 'trial'
where subscription_status = 'active'
  and id in (
    select user_id
    from public.subscriptions
    where status = 'trial'
      and razorpay_subscription_id is null
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

create index if not exists subscription_payments_user_created_idx
  on public.subscription_payments(user_id, created_at desc);

create index if not exists billing_invoices_user_created_idx
  on public.billing_invoices(user_id, created_at desc);

create unique index if not exists subscription_payments_razorpay_payment_id_key
  on public.subscription_payments(razorpay_payment_id)
  where razorpay_payment_id is not null;

alter table public.subscription_payments enable row level security;
alter table public.billing_invoices enable row level security;

drop policy if exists "Users can read own subscription payments" on public.subscription_payments;
create policy "Users can read own subscription payments"
  on public.subscription_payments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own billing invoices" on public.billing_invoices;
create policy "Users can read own billing invoices"
  on public.billing_invoices for select
  using (auth.uid() = user_id);

drop policy if exists "Super admins can read all subscription payments" on public.subscription_payments;
create policy "Super admins can read all subscription payments"
  on public.subscription_payments for select
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'super_admin'
    )
  );

drop policy if exists "Super admins can read all billing invoices" on public.billing_invoices;
create policy "Super admins can read all billing invoices"
  on public.billing_invoices for select
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
