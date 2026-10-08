-- ============================================================
-- CrediGuide — Supabase schema (Phase 1)
-- Replaces the MongoDB collections: users, creditscores, loans,
-- payments, notifications.
-- Auth is handled by Supabase Auth (email + password only).
-- Run this in the Supabase SQL editor, or via a Postgres client
-- using the project's database password.
-- Safe to re-run: drops and recreates the CrediGuide tables.
-- ============================================================

begin;

drop table if exists public.notifications cascade;
drop table if exists public.payments cascade;
drop table if exists public.loans cascade;
drop table if exists public.credit_scores cascade;
drop table if exists public.profiles cascade;

-- ---------------- Profiles (1 row per Supabase Auth user) ----
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  email      text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------- Credit scores (history = many rows) --------
create table public.credit_scores (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.profiles (id) on delete cascade,
  score              integer not null check (score between 300 and 900),
  payment_history    integer not null default 0 check (payment_history between 0 and 100),
  credit_utilization integer not null default 0 check (credit_utilization between 0 and 100),
  credit_age         integer not null default 0 check (credit_age between 0 and 100),
  credit_accounts    integer not null default 0 check (credit_accounts between 0 and 100),
  source             text not null default 'Demo data (prototype)',
  score_date         timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index credit_scores_user_date_idx
  on public.credit_scores (user_id, score_date desc);

-- ---------------- Loans -------------------------------------
create table public.loans (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  loan_type        text not null check (loan_type in (
                     'Gold Loan', 'Personal Loan', 'Home Loan', 'Vehicle Loan',
                     'Education Loan', 'Credit Card', 'Other Finance')),
  loan_name        text not null,
  total_amount     numeric(12, 2) not null check (total_amount >= 0),
  amount_paid      numeric(12, 2) not null default 0 check (amount_paid >= 0),
  emi_amount       numeric(12, 2) not null default 0 check (emi_amount >= 0),
  due_date         date not null,
  start_date       date,
  end_date         date,
  status           text not null default 'Active'
                     check (status in ('Active', 'Paid', 'Overdue')),
  reminder_enabled boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index loans_user_due_idx on public.loans (user_id, due_date);

-- ---------------- Payments ----------------------------------
create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete cascade,
  type             text not null check (type in ('Credit Card', 'EMI')),
  title            text not null,
  amount           numeric(12, 2) not null check (amount >= 0),
  due_date         date not null,
  status           text not null default 'Upcoming'
                     check (status in ('Upcoming', 'Due Soon', 'Paid', 'Overdue')),
  paid_at          timestamptz,
  reminder_enabled boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index payments_user_due_idx on public.payments (user_id, due_date);

-- ---------------- Notifications ------------------------------
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  type          text not null check (type in ('Payment', 'EMI', 'Credit Score', 'General')),
  title         text not null,
  message       text not null,
  read          boolean not null default false,
  scheduled_for timestamptz,
  created_at    timestamptz not null default now()
);

create index notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

-- ============================================================
-- Row Level Security — every user sees only their own rows
-- (same RLS-everywhere approach as LCO CONNECT)
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.credit_scores enable row level security;
alter table public.loans         enable row level security;
alter table public.payments      enable row level security;
alter table public.notifications enable row level security;

create policy "profiles: own row"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "credit_scores: own rows"
  on public.credit_scores for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "loans: own rows"
  on public.loans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "payments: own rows"
  on public.payments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications: own rows"
  on public.notifications for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- Auto-create a profile when a user registers
-- (full name is passed by the app as user metadata at signup)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

commit;
