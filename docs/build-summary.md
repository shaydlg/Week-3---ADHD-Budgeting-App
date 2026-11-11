# Build summary (MVP #1)

A record of what was built and the decisions behind it, for the Week 4 coding
challenge. (The graded "What I Did" and "What I Learned" write-ups are separate
and written by the author, not AI.)

## What was built
A live, three-tier web app that helps adults with ADHD budget: the three core
capabilities all work end to end.

- **Accounts and security:** email/password sign up, log in, log out, and a
  protected dashboard. Each person only ever sees their own data.
- **Bills:** add, edit, mark paid, and delete bills.
- **Bank connection and spending:** connect a bank through Plaid (read-only),
  see accounts and balances, and pull in transactions automatically.
- **Safe-to-spend:** one clear number = money in checking and savings minus
  upcoming unpaid bills, recomputed whenever the data changes.
- **Calm UI:** collapsible sections and a safe-to-spend number kept in view,
  to avoid overwhelm.

## Stack
- Next.js (App Router) + Material UI for the screens
- Vercel for hosting (auto-deploys from GitHub `main`)
- Supabase for the Postgres database, auth, and Row Level Security
- Plaid (Sandbox) for read-only bank data

## Key decisions
Each is recorded in `docs/adr`:
- ADR-0001 Next.js with Material UI
- ADR-0002 Host on Vercel
- ADR-0003 Supabase for database, auth, and access rules
- ADR-0004 Plaid for read-only bank data
- ADR-0005 GitHub with a pull-request and CI/CD workflow
- ADR-0006 Keep sensitive work (and secret keys) on the server
- ADR-0007 Pull transactions with `/transactions/get` (not `/transactions/sync`)

## Data model
Core tables: `profiles`, `plaid_items`, `linked_accounts`, `transactions`,
`categories`, `bills`, `reminders`. See `docs/database-diagram.md`. Every table
has Row Level Security so a person can only reach rows where `user_id` is their
own. Schema changes are SQL migrations in `supabase/migrations`.

## Security
- Row Level Security on every table, tested with two accounts.
- Secrets live in environment variables (git-ignored locally, set in Vercel),
  never in the code. Server-only keys have no `NEXT_PUBLIC_` prefix.
- Plaid access is read-only; the bank login happens inside Plaid's own window,
  so the app never sees bank credentials.
