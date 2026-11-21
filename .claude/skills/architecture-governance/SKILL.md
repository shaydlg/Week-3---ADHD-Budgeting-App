---
name: architecture-governance
description: Use when making or reviewing an architectural decision, or checking a change before merge — new framework, database, state management, API shape, data model, migration, layering, or any structural change. Runs an architecture review gate so decisions are recorded, layers stay separated, data has one home, and claims are backed by real test output. Trigger on words like architecture, ADR, decision record, layering, separation of concerns, data model, schema, migration, structural, design review, drift, or before merging anything that changes how the system is put together.
---

# Architecture Governance

## Why this exists

Code rots at the seams, not in the middle. A feature works, so nobody writes down *why* it was built
that way; six months later someone reverses the decision without knowing it was a decision at all. A UI
screen reaches straight into the database "just this once," and now business logic lives in three places.
These failures are quiet — nothing breaks today — which is exactly why they need a gate. This skill is
that gate: a short, deliberate review you run when the *shape* of the system changes, not its details.

## The main idea

Architecture is the set of decisions that are expensive to reverse. Record them, keep the layers apart,
give every fact one home, and never report a structural change as safe until real test output says so.
When something here is already covered by another skill, defer to it rather than restating it.

## When to run this

Run the gate when a change touches structure: choosing or swapping a framework, database, or state
management approach; changing an API's shape; altering the data model or writing a migration; moving
responsibilities between layers; or introducing a new cross-cutting pattern. Ordinary feature work
*inside* an existing structure does not need it — say so and move on. The point is to catch the decisions
that are costly to undo, not to tax every edit.

## The checklist

### 1. Decisions are recorded (ADRs)

- **Write it down.** Every major technical choice gets a short Architectural Decision Record in
  `docs/adr/`. An ADR names the context, the options considered, the choice, and the trade-offs accepted.
  If you can't state the alternatives you rejected, you haven't made a decision yet — you've made an
  assumption.
- **Supersede, don't erase.** When a decision changes, write a new ADR that marks the old one superseded.
  The history of *why* is as valuable as the current state; deleting it throws away the reasoning the
  next person will need.
- **No silent structural changes.** If this change alters an architectural decision, it comes with an
  ADR. A structural change with no record is the thing this gate exists to catch.

### 2. Layers stay separated

- **Three layers, kept apart.** Presentation (UI), Domain (business rules), and Data Source
  (database/APIs) are distinct. Dependencies point inward: the domain and data layers know nothing about
  the UI.
- **No UI-to-database shortcuts.** Screens talk to the system through domain services or APIs, never by
  querying the database directly. One shortcut becomes the pattern everyone copies.
- **Business logic runs without a screen.** If you can't test a business rule without rendering a page or
  faking an HTTP request, the logic is tangled into the wrong layer. Being able to test it in isolation
  is the proof the separation is real.

### 3. Data has one home

- **Single source of truth.** Every piece of data has one defined place in the schema. Duplicated state
  drifts, and then two screens disagree about what's true.
- **Access control at the data layer.** Tables enforce who can read and write each row (for example,
  row-level security), so a user can only reach their own data even if application code has a bug.
- **Migrations, not hand-edits.** Schema changes are versioned, repeatable migration files — never ad-hoc
  edits to a live table. The migration *is* the record of how the schema got here.
- **The model fits the use cases.** The entity structure supports the features that need it and the query
  loads they'll put on it. A clean diagram that can't answer the app's real questions isn't done.

### 4. The non-functional basics hold

- **Security:** apply the **secure-coding** skill for input handling, injection, secrets, and access
  control — don't restate OWASP here, run that skill. Then confirm the architectural slice of it: internal
  identifiers, UUIDs, and credentials are stripped from user-facing logs and API responses.
- **Resilience:** every call to a third-party API or service has a timeout, retry policy, and rate-limit
  handling. An integration with no timeout is an outage waiting for the other side to be slow.
- **Performance foundations:** hot queries are indexed and shaped to avoid obvious N+1 patterns, and slow
  work runs async so it doesn't block the user.

### 5. The design is testable

- **Behaviour is specified.** Key workflows are written as `Given / When / Then` scenarios that cover the
  happy path *and* the edges (empty, invalid, denied, duplicated). The scenarios double as the spec.
- **A sensible test shape.** Many fast unit tests over the domain logic, fewer slow end-to-end tests —
  enough coverage to catch regressions without a pipeline that takes an hour.
- **Deterministic checks.** Assertions pass or fail on their own; verification doesn't depend on a human
  or a model eyeballing the result and declaring it fine.

## How to prove it

Claims about structure are cheap; output is not. When you report this change, state plainly:

- which ADRs you added or consulted,
- which layers the change touched and how the separation held,
- and the **actual result** of the tests and checks you ran — the command and what it returned.

"Everything looks clean" is not proof. If you didn't run it, say you didn't. A short, honest receipt —
files changed, ADRs touched, tests run and their real output — is what lets the next person trust the
change without re-deriving it. If a check *can* be made mechanical (a CI script that fails the build on a
forbidden import or a layer breach), prefer that over a promise, because a gate that runs itself is the
only one that never gets skipped.
