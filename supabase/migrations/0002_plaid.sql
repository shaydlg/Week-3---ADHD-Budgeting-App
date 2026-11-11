-- Plaid integration (MVP #1): store bank connections, and link accounts and
-- transactions to Plaid. Run once in the Supabase SQL Editor.

-- Holds one row per connected bank. The access_token is sensitive, so this
-- table is only ever read by server code; the browser never queries it.
create table public.plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  access_token text not null,
  item_id text not null,
  institution_name text,
  cursor text, -- remembers our place when syncing transactions
  created_at timestamptz not null default now()
);

-- Link existing tables to Plaid.
alter table public.linked_accounts
  add column plaid_item_id uuid references public.plaid_items (id) on delete cascade,
  add column plaid_account_id text;

alter table public.transactions
  add column plaid_transaction_id text;

-- Prevent duplicate transactions when we re-sync.
create unique index transactions_plaid_txn_uniq
  on public.transactions (user_id, plaid_transaction_id)
  where plaid_transaction_id is not null;

create index on public.plaid_items (user_id);
create index on public.linked_accounts (plaid_item_id);

-- Row Level Security: each person only ever touches their own rows.
alter table public.plaid_items enable row level security;

create policy "Own plaid_items" on public.plaid_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.plaid_items to authenticated;
