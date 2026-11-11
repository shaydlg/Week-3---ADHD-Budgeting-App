-- Store each account's type so safe-to-spend can count only spendable money
-- (checking and savings), not loans, credit cards, or retirement accounts.
-- Run once in the Supabase SQL Editor.

alter table public.linked_accounts
  add column account_type text,
  add column account_subtype text;
