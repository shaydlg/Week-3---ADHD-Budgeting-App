# Week 5 — QA Findings Report

From the Week 5 QA pass on the ADHD Budgeting App: automated checks (unit,
integration-style, browser smoke) plus two manual test cases run by hand on the
live app. Both manual test cases **passed**; the pass also surfaced five
improvements.

## Summary

| # | Finding | Type | Severity | Suggested fix |
| --- | --- | --- | --- | --- |
| 1 | Add Bill / Mark Paid show a 2–3s delay with no loading feedback | UX | Medium | Loading spinner on submit |
| 2 | Savings balances count toward "Safe to spend" | Behavior | Medium | Count **checking only** |
| 3 | Browser-autofilled email field looks disabled (gray) | UI | Low | Style the `:-webkit-autofill` state to match |
| 4 | "Undo" missing after Mark Paid (spec says it should exist) | Gap vs T26 | Medium | Build undo (un-pay) |
| 5 | Marking a bill paid *raises* Safe to spend though the money is leaving | Product | High | Design decision — see vision/scope handoff |

## Resolved during testing (not bugs)
- **Mid-action logout with no notice:** happened only in the isolated testing
  browser pane; **not reproducible in Chrome**. Testing-environment quirk.
- **Logout with the inactivity notice:** the real 5-minute idle timeout working
  as designed (triggered by stepping away).

## Detail

**1 — Loading feedback.** Both Add Bill and Mark Paid take a couple of seconds and
the screen briefly shows a stale state before updating. A spinner on the submit
button ("visibility of system status") removes the confusion.

**2 — Savings is spendable.** Spendable is currently `checking + savings`. Product
intent: savings is money set aside *not* to spend day-to-day. Money-market and
cash-management are already excluded; savings should be too → spendable = checking
only.

**3 — Autofill styling.** Choosing the browser's suggested email paints Chrome's
autofill background, which clashes with the field style and reads as *disabled*.
Fixable with CSS on the autofill pseudo-class.

**4 — Undo missing.** `markBillPaid` only flips status to "paid" — there is no undo
anywhere in the code, but backlog **T26 ("Mark a bill paid (with undo)")** and the
Epics "non-happy path" require it. A mis-tapped bill is currently stuck as paid.

**5 — Mark-paid vs. the honest number (product).** See the vision/scope handoff
doc. Short version: Plaid balances are read-only and lag, so marking a bill paid
removes it from "owed" and pushes Safe to spend **up** before the bank balance
drops — temporarily overstating what's safe to spend.

## Suggested Kanban tickets
- **T56 · Loading spinner on Add Bill + Mark Paid** (Spending/Bill mgmt) — quick
- **T57 · Safe-to-spend counts checking only (exclude savings)** (Safe-to-spend) — quick
- **T58 · Fix autofilled email field styling** (Accounts & security) — quick
- **T59 · Build Undo for Mark Paid** (Bill management) — medium
- **T60 · Decide mark-paid vs. safe-to-spend semantics** (Safe-to-spend) — design, see vision/scope
