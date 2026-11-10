-- ADHD Budgeting App, initial database schema (MVP #1)
-- Six tables: profiles, linked_accounts, categories, transactions, bills, reminders.
-- Every table has Row Level Security so each person can only see their own rows.
-- Run this once in the Supabase SQL Editor.

-- 1. PROFILES: one row per person, linked to Supabase Auth's user record.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  persona text,                         -- optional "what best describes you?" answer
  created_at timestamptz not null default now()
);

-- When a new user signs up, automatically create their profile row.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. LINKED_ACCOUNTS: bank accounts connected through Plaid.
create table public.linked_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bank_name text not null,
  account_name text,
  balance numeric(12, 2),
  created_at timestamptz not null default now()
);

-- 3. CATEGORIES: spending buckets (Groceries, Rent, ...).
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null
);

-- 4. TRANSACTIONS: spending, imported from Plaid or added by hand.
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.linked_accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(12, 2) not null,
  description text,
  date date not null default current_date,
  is_manual boolean not null default false,
  created_at timestamptz not null default now()
);

-- 5. BILLS: upcoming bills to track.
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  due_date date not null,
  recurrence text not null default 'none',   -- none, weekly, monthly
  status text not null default 'upcoming',    -- upcoming, paid
  created_at timestamptz not null default now()
);

-- 6. REMINDERS: nudges before a bill is due.
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bill_id uuid not null references public.bills (id) on delete cascade,
  remind_at timestamptz not null,
  channel text not null default 'email',      -- email, in_app
  sent boolean not null default false
);

-- Helpful indexes: look-ups are almost always "rows for this user".
create index on public.linked_accounts (user_id);
create index on public.categories (user_id);
create index on public.transactions (user_id);
create index on public.transactions (account_id);
create index on public.transactions (category_id);
create index on public.bills (user_id);
create index on public.reminders (user_id);
create index on public.reminders (bill_id);

-- Turn ON Row Level Security for every table.
alter table public.profiles enable row level security;
alter table public.linked_accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.bills enable row level security;
alter table public.reminders enable row level security;

-- Access rules: a logged-in person may only touch rows that are theirs.
-- auth.uid() is the id of the person making the request.
create policy "Own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Own linked_accounts" on public.linked_accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own categories" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own transactions" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own bills" on public.bills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Own reminders" on public.reminders
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Because we turned OFF "automatically expose new tables", we grant access
-- explicitly, and only to logged-in (authenticated) users. Anonymous visitors
-- get nothing. Row Level Security above still limits them to their own rows.
grant usage on schema public to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.linked_accounts,
  public.categories,
  public.transactions,
  public.bills,
  public.reminders
to authenticated;
