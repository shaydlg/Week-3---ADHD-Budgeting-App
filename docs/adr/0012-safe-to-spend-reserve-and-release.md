# ADR-0012: Safe-to-spend uses a reserve-and-release model for bills

## Date and status
November 25, 2026. Accepted. Extends ADR-0010 (credit cards). Surfaced by Week 5
QA. Source decision: `ADHD-Budgeting-App-Decision-Safe-to-Spend-Reserve-Release.md`.

## Context
QA of the "mark a bill paid" flow found that marking a bill paid removed it from
"upcoming," so safe-to-spend jumped **up** by the bill's amount. But the bank
balance comes from Plaid, which is **read-only** and lags behind real payments.
So for a window the money is counted in neither the balance drop nor the bill
deduction, and safe-to-spend reads too high. Overstating safe-to-spend invites an
overspend and an overdraft — the penalty-and-shame spiral this app exists to
prevent. The tension: the app can read the bank balance but cannot change it, and
"mark paid" happens before the bank reflects the payment.

## Options
- **A. Reserve-and-release (chosen).** Reserve a bill out of safe-to-spend when it
  is added; release the reservation only when the money actually leaves the
  account; marking paid is a no-op for the number. Honest number, nothing to
  configure.
- **B. Mark-paid is informational only.** Rejected: the overstatement window
  remains (just explained away), and a button that appears to do nothing reads as
  broken.
- **C. User chooses "auto-paid from checking" vs "tracked only" per bill.**
  Rejected: pushes a finance decision onto the user for every bill — high
  cognitive load, the opposite of "does the work for you."

## Decision
Safe-to-spend = checking balance − money reserved for upcoming bills.

- **Reserve on add.** A bill is reserved (deducted) the moment it is added,
  because that money is committed, not spendable.
- **Mark paid is a no-op for the number.** The money was already reserved, so
  paying it changes nothing — as long as the amount paid matches the logged amount.
- **Release on real withdrawal.** The reservation releases only when the money
  actually leaves the account (a matching transaction posts, or the balance
  drops), never when the paid flag flips. The balance drop and the release cancel
  out, so the number stays steady.
- **Anchor on the real amount.** If the actual payment differs from the logged
  amount, the number self-corrects to the real transaction, with a gentle note
  explaining the difference.
- **Guiding principle:** when unsure during the lag, keep the money reserved.
  Understating is the safe side; the number never jumps up because a flag flipped.
- **What the user sees:** one quiet, expandable "set aside for upcoming bills" line
  under the number (recurring bills silent, non-recurring surfaced), and an Undo
  on mark-paid (closes the T26 gap).

## Consequences
- Changes the behavior recorded in T28 (safe-to-spend), T26 (mark paid), and T29
  (plain-language explanation). Tracked as new fix tickets (T61–T63) rather than
  rewriting those already-Done tickets.
- **New enabler:** match a posted transaction to a reserved/paid bill to release
  the reservation (uses the transaction data from T15/T16), with a fallback window.
- Align with the credit-card work (T52–T55) so card-payment bills inherit the same
  reserve-and-release behavior rather than being retrofitted.
- **Open items to settle:** the fallback-window length when no matching
  transaction is found (a few business days, default conservative), and the
  amount/date matching tolerance for pairing a transaction to a bill.
