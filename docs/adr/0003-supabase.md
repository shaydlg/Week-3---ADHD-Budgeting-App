# ADR-0003: Use Supabase for database, auth, and access rules

## Date and status
November 10, 2026. Accepted.

## Context
We need to store users' financial data, let people sign up and log in, and make sure each person can only ever see their own data.

## Options
- Build our own database + login system:
  - Good: full control.
  - Bad: slow to build, and easy to get security wrong with financial data.
- Supabase:
  - Good: a Postgres database, a built-in sign-in system, and Row Level Security in one place; free tier.
  - Bad: we must learn its access-rule model and manage schema changes as SQL migrations.

## Decision
Use Supabase for the database, authentication (email + password), and Row Level Security.

## Consequences
Every table has Row Level Security turned on with a policy limiting rows to `auth.uid() = user_id`, so a person can only reach their own data. Schema changes are written as SQL migration files in `supabase/migrations`. The same Supabase project backs both local development and the live site.
