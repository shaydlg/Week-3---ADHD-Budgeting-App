# ADR-0002: Host the app on Vercel

## Date and status
November 10, 2026. Accepted.

## Context
We need to run our Next.js app somewhere on the internet and publish it at a public web address, without managing our own servers.

## Options
- Run our own server (a VM):
  - Good: full control.
  - Bad: we have to set up, secure, and maintain it ourselves.
- Vercel:
  - Good: built for Next.js; deploys automatically from GitHub; gives HTTPS and a public URL; free tier.
  - Bad: our code runs inside their serverless time limits, so long operations must stay fast.

## Decision
Host on Vercel, deploying automatically from the GitHub `main` branch.

## Consequences
Every push to `main` rebuilds and republishes the live site. We keep server actions fast (for example, batching database inserts) to stay within the function time limit. Environment variables must be set in Vercel and a redeploy is needed for changes to take effect.
