-- Credit cards (MVP #1): store the Plaid Liabilities figures for each connected
-- credit card, and let a bill link back to the card it pays. See ADR-0010.
-- Run once in the Supabase SQL Editor.

-- One row per connected credit card (a linked_account of type 'credit').
-- These figures come from Plaid's Liabilities product and are refreshed each
-- statement cycle. current_balance is for display only and is never counted as
-- spendable money; safe-to-spend only ever subtracts a card PAYMENT once it
-- exists as a bill.
create table public.card_liabilities (
  account_id uuid primary key references public.linked_accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  statement_balance numeric(12, 2), -- Plaid last_statement_balance: default "add to bills" amount
  minimum_payment numeric(12, 2),   -- Plaid minimum_payment_amount: the "minimum" button + guardrail
  due_date date,                    -- Plaid next_payment_due_date: the card bill's due date
  current_balance numeric(12, 2),   -- Plaid balances.current: display only, never spendable
  last_refreshed_at timestamptz,    -- when we last pulled these figures (cycle refresh)
  created_at timestamptz not null default now()
);

-- Link a bill to the card it pays. Null for ordinary (non-card) bills.
-- If the card account is removed, keep the bill but unlink it (it becomes a
-- plain bill and the auto-refresh ignores it).
alter table public.bills
  add column source_card_id uuid references public.linked_accounts (id) on delete set null,
  add column basis text check (basis in ('statement', 'minimum', 'custom'));

create index on public.card_liabilities (user_id);
create index on public.bills (source_card_id);

-- Row Level Security: each person only ever touches their own rows.
alter table public.card_liabilities enable row level security;

create policy "Own card_liabilities" on public.card_liabilities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.card_liabilities to authenticated;
