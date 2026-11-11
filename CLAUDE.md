# ADHD Budgeting App

Read every ADR in `docs/adr` before making changes, and write a new ADR for every big decision.

## Stack
- Next.js (App Router) + Material UI for the screens
- Vercel for hosting (auto-deploys from `main`)
- Supabase for the database, auth, and Row Level Security
- Plaid (Sandbox) for read-only bank data

## Conventions
- Data changes go in server actions, which check the logged-in user; reads happen in server components. Row Level Security limits every query to the current user's rows.
- Secrets live in `.env.local` (git-ignored) and in Vercel's environment variables. Never commit them. Keys without a `NEXT_PUBLIC_` prefix stay on the server.
- Database changes are SQL migration files in `supabase/migrations`, applied in the Supabase SQL Editor. The same Supabase project backs local and live.
- Run the app locally with `npm run dev`.
