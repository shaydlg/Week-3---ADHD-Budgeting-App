# ADR-0005: Use GitHub with a pull-request and CI/CD workflow

## Date and status
November 10, 2026. Accepted.

## Context
We need version control, a history of changes, and a way to keep broken code from reaching the live site.

## Options
- No version control / edit files in place:
  - Good: nothing to set up.
  - Bad: no history, no review, easy to lose work and ship breakage.
- GitHub with pull requests and automated checks:
  - Good: full history; changes go through pull requests; automated checks (type-check and build) can gate merges; integrates with Vercel.
  - Bad: a little more process per change.

## Decision
Store the code on GitHub, work through branches and pull requests, and run automated checks (type-check and build) before changes reach `main`, which Vercel deploys.

## Consequences
`main` stays deployable. Broken code is caught before it goes live. A GitHub Actions workflow runs the checks on each pull request (to be added as a small `ci.yml`).
