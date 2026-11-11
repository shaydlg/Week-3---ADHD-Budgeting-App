# ADR-0004: Use Plaid for read-only bank data

## Date and status
November 11, 2026. Accepted.

## Context
A core feature is automatic spending tracking, which needs secure access to users' bank transactions. We must never see or store bank passwords.

## Options
- Ask users to type transactions in by hand:
  - Good: no bank integration.
  - Bad: high effort, exactly the chore our ADHD users avoid.
- Plaid:
  - Good: industry standard; the user logs in to their bank inside Plaid's own window, so we never see credentials; returns read-only access.
  - Bad: a paid service per connected user, and a non-trivial connect flow.

## Decision
Use Plaid (Sandbox for the course) for read-only bank connections and transaction data.

## Consequences
The user logs in to their bank through Plaid's secure window, not our app. The Plaid access token is stored server-side only (in `plaid_items`, never sent to the browser) and the Plaid secret is a server-only environment variable. The connect flow lives in server actions, and transactions are pulled and saved to our database.
