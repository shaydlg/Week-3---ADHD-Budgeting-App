# ADR-0007: Pull transactions with /transactions/get, not /transactions/sync

## Date and status
November 11, 2026. Accepted.

## Context
After connecting a bank, we need to pull in the user's transactions. Plaid offers two endpoints for this, and they behave differently for a brand-new connection.

## Options
- `/transactions/sync` (incremental cursor):
  - Good: Plaid's recommended endpoint for production; only returns what changed.
  - Bad: for a freshly linked item it relies on a webhook to signal readiness. We have no webhook set up, so it kept returning an empty list.
- `/transactions/get` (date range):
  - Good: returns the transactions directly for a date window, which works reliably in Sandbox without webhooks.
  - Bad: not incremental, so we re-fetch a window and rely on a unique index to avoid duplicates.

## Decision
Pull transactions with `/transactions/get` over a 30-day window, with a short poll (the data can take a few seconds to be ready), and de-duplicate using a unique index on `(user_id, plaid_transaction_id)`.

## Consequences
Transactions load reliably in Sandbox without webhooks. Re-syncing is safe because duplicates are ignored by the unique index. If we move to production scale, we may revisit `/transactions/sync` together with a webhook endpoint.
