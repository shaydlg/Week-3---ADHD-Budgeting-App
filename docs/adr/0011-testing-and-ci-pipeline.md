# ADR-0011: Automated testing and a GitHub Actions CI pipeline

## Date and status
November 21, 2026. Accepted. Delivers the pipeline promised in ADR-0005.

## Outcome (the goal, stated plainly)
Every time code is pushed to the ADHD Budgeting App, automatic checks should
catch new bugs, regressions, broken budget math, and anything that violates the
Week 1 engineering standards (accessibility, security, UX, architecture) before
it reaches the live app. Anything that fails those checks should be blocked from
merging, so `main` stays deployable and the app stays honest and calm for users.

## Context
The app had no automated tests and no CI workflow, so a change could break the
budget math, the build, or an engineering standard and still reach the live site.
ADR-0005 committed to running automated checks before code reaches `main` but left
the actual workflow "to be added." Week 5's goal is to close that gap: turn the
Week 2 use cases and BDD scenarios into checks that run on every push, and
gate-check the Week 1 Claude Skills.

## Options
- **No automated tests, rely on manual testing only:** nothing to maintain, but
  every regression is caught by a human (or a user), which does not scale and
  misses the math errors tests are best at.
- **Unit tests only:** cheap and fast, but nothing proves the real app boots and
  the security gate works in a browser.
- **Full end-to-end suite (logged-in flows in CI):** highest confidence, but
  needs a seeded test user and live Supabase access in CI, which is brittle and
  secret-heavy for a free-plan student project. Rejected for now.
- **A testing pyramid plus CI (chosen):** many fast unit tests, one browser smoke
  test, and the logged-in flows covered by hand as manual test cases.

## Decision
Add automated testing and a CI pipeline, shaped like the testing pyramid.

- **Testable core:** the budget math (safe-to-spend, spendable balance, upcoming
  bills, bill validation) was extracted from the dashboard page into
  `src/lib/budget.ts` as pure functions. The on-screen behavior is unchanged; the
  math now has one home that can be tested in isolation.
- **Unit tests (Vitest):** `src/lib/budget.test.ts` covers safe-to-spend
  (including the ADR-0010 credit-card rules), the spending total, and bill
  validation. Pinned to Vitest v2 because v3 requires a newer `@types/node` than
  the project's v20.
- **Coverage gate:** unit-test coverage of `src/lib/budget.ts` must stay at or
  above 90% (Vitest's v8 coverage, enforced by `npm test`). Scoped to the tested
  logic on purpose, so the gate is meaningful ("don't add untested budget math")
  rather than a low, noisy whole-app number. It immediately caught two untested
  null-handling branches, which we then covered.
- **One validation rule, used for real:** `isValidBill` is the single source of
  truth and is now called by the `addBill`/`editBill` server actions, so the unit
  tests guard the code that actually runs.
- **Browser smoke test (Playwright):** `e2e/auth.spec.ts` drives a real browser
  to `/dashboard` while logged out and confirms it redirects to `/login` — the
  security gate, proven end-to-end without a login.
- **Skills gate-check:** the four Week 1 skills are vendored into
  `.claude/skills/`, and `scripts/check-skills.mjs` fails the build if a skill is
  missing or its frontmatter is broken.
- **Pipeline (`.github/workflows/ci.yml`):** on every push and pull request, a
  `quality` job runs lint, type-check, unit tests, the skills check, and the
  build. A separate `e2e` job runs the browser smoke test; it skips (staying
  green) until the two public Supabase keys are set as repository secrets, then
  becomes a real gate.
- **No branch protection:** the project is on GitHub's free plan, so a red run is
  a signal not to merge rather than an enforced block.

## Consequences
- Every push is checked automatically; a failing check is the signal to fix
  before merging, and a green `main` is what Vercel deploys.
- New developer dependencies: `vitest`, `@playwright/test`, and a one-time
  Chromium download in CI for the e2e job.
- The e2e job depends on the `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` repository secrets. Without them it skips.
- Logged-in flows (add a bill and watch safe-to-spend change, mark a bill paid,
  connect the sandbox bank) are intentionally **not** automated; they are covered
  by the two manual test case scenarios, run by hand on the live app.
- Turning on lint surfaced and fixed a pre-existing React issue in the login page
  (`set-state-in-effect`), documented inline with a scoped exception.
