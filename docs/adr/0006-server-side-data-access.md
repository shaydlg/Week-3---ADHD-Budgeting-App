# ADR-0006: Keep sensitive work on the server

## Date and status
November 10, 2026. Accepted.

## Context
This is a financial app. Secret keys and the logic that touches money data must not be exposed in the browser, where anyone can inspect it.

## Options
- Do data work in the browser (client components calling the database directly):
  - Good: simple to write.
  - Bad: any secret used there is exposed; harder to enforce trust.
- Do data work on the server (server actions and server components):
  - Good: secrets stay on the server; every action can check the logged-in user; Row Level Security still applies using the user's session.
  - Bad: a little more indirection to learn.

## Decision
Do all data changes in server actions, read data in server components, and keep secret keys as server-only environment variables (no `NEXT_PUBLIC_` prefix).

## Consequences
Every server action checks the logged-in user before touching data. The Supabase publishable key is safe in the browser (protected by Row Level Security), but the Plaid secret and the Plaid access token never leave the server. Secrets live in `.env.local` (git-ignored) and in Vercel's environment variables.
