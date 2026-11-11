# ADR-0001: Use Next.js with Material UI

## Date and status
November 10, 2026. Accepted.

## Context
We need screens and some server-side code for a three-tier web app that runs on Vercel, and the interface must meet WCAG 2.2 AA accessibility for our ADHD audience.

## Options
- Plain React:
  - Good: simple to start.
  - Bad: needs a separate place for server code; we would build common UI parts and accessibility from scratch.
- Next.js with Material UI:
  - Good: holds screens and server code in one project; Material UI gives polished, accessible components out of the box.
  - Bad: we must learn which code runs in the browser and which runs on the server.

## Decision
Use Next.js (App Router) with Material UI. It covers two of our three tiers in one project and gives us accessible UI components.

## Consequences
We learn where code runs (browser vs server). Material UI's theme setup needs a "use client" line. We also turned off two experimental Next.js features (`cacheComponents`, `partialPrefetching`) in `next.config.ts` because they tried to pre-render our private, per-user pages, and turned off React Strict Mode because it made Plaid Link load twice in development.
