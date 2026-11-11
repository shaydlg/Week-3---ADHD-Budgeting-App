-- The partial unique index on transactions (with a WHERE clause) cannot be used
-- as an upsert conflict target. Replace it with a plain unique index. Postgres
-- treats NULLs as distinct, so manual transactions (null plaid_transaction_id)
-- are unaffected. Run once in the Supabase SQL Editor.

drop index if exists transactions_plaid_txn_uniq;

create unique index transactions_plaid_txn_uniq
  on public.transactions (user_id, plaid_transaction_id);
