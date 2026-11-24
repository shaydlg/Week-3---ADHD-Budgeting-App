# Test Case 1 — Adding a bill lowers "Safe to spend"

## Use Case Scenario Being Tested
Bill tracking and safe-to-spend recompute: a user adds an upcoming bill and the single "Safe to spend" number updates to account for it.

## Test Case Scenario Being Tested
An existing, logged-in user adds a new unpaid bill, and "Safe to spend" drops by exactly that amount, with its explanation line updated.

## Pre-Conditions of the Whole Test Case Scenario
- Logged in, on the dashboard.
- A checking and a savings account are connected (spendable balance = $320.00).
- Baseline noted: Safe to spend = $297.78; 1 upcoming bill (Spotify, $22.22).

## Given / When / Then
- **Given** I am an existing user logged in on the dashboard
- **And** my safe-to-spend is $297.78
- **When** I add a new $50 bill
- **Then** my safe-to-spend decreases by $50
- **And** the new total shown is $247.78

## Steps to Complete the Whole Test Case Scenario
1. Note the baseline Safe to spend and the "in checking and savings, minus … in upcoming bills" line.
2. Open the Bills section and choose "Add a bill."
3. Enter name "Test Electric," amount $50, due date 2026-12-13.
4. Submit the bill.

## Expected Results of the Whole Test Case Scenario
- "Test Electric" appears in the upcoming bills list.
- Safe to spend decreases by exactly $50 → $247.78.
- The upcoming-bills total rises to $72.22.

## Actual Results
Result: PASS. The math was correct and no duplicate bill was created. (Observed: a brief loading flash before the new bill rendered; and on a first attempt in the isolated testing browser the action redirected to login — not reproducible in Chrome, so a testing-environment quirk.)

| Step | What did you do? | What should happen? | What actually did happen? | Notes |
| --- | --- | --- | --- | --- |
| 1 | Noted the baseline | — | Safe to spend $297.78; upcoming $22.22 | Baseline |
| 2–4 | Added "Test Electric," $50 | Bill saved; Safe to spend drops $50 | Safe to spend → $247.78; line → "minus $72.22"; bill listed | Passed exactly as predicted |

---

# Test Case 2 — Marking a bill paid

## Use Case Scenario Being Tested
Mark a bill paid: a user marks an upcoming bill as paid, and it leaves the upcoming list while "Safe to spend" stays correct.

## Test Case Scenario Being Tested
An existing, logged-in user marks the "Test Electric" $50 bill as paid; it leaves the upcoming list, and safe-to-spend stays deducted because the money was spent. (Bonus: an undo option should restore it.)

## Pre-Conditions of the Whole Test Case Scenario
- Logged in, on the dashboard (tested in Chrome).
- "Test Electric" ($50) is an upcoming, unpaid bill.
- Baseline noted: Safe to spend = $247.78; 2 upcoming bills.

## Given / When / Then
- **Given** a $50 bill is unpaid and my safe-to-spend is $247.78
- **When** I mark the bill paid
- **Then** the bill leaves the upcoming list
- **And** my safe-to-spend stays $247.78 (the money was spent, not restored)

## Steps to Complete the Whole Test Case Scenario
1. Note the baseline Safe to spend and the upcoming bills count.
2. In the Bills section, find "Test Electric" and choose "Mark paid."
3. Bonus: if an "Undo" option appears, click it.

## Expected Results of the Whole Test Case Scenario
- "Test Electric" leaves the upcoming list.
- Safe to spend **stays $247.78** — the $50 was spent paying the bill, so it should remain deducted, not restored.
- Bonus: an Undo option restores the bill.

## Actual Results
Result: PARTIAL — the removal works, but safe-to-spend behaves incorrectly (a real defect this test surfaced).

- "Test Electric" left the upcoming list. ✅ PASS
- Safe to spend **rose to $297.78** instead of staying $247.78 — the app drops the bill immediately while the bank balance lags (Plaid is read-only), so the already-spent money looks restored. ❌ FAIL — defect (see QA finding #5).
- Also observed: a 2–3 second delay with no loading indicator; and no Undo option appeared (undo is not implemented, though ticket T26 says it should exist).

| Step | What did you do? | What should happen? | What actually did happen? | Notes |
| --- | --- | --- | --- | --- |
| 2 | Marked "Test Electric" paid | Bill leaves upcoming; safe-to-spend stays $247.78 | Bill left upcoming (correct); safe-to-spend rose to $297.78 (wrong) | Removal passes; safe-to-spend is a defect (finding #5) |
| 2 | (timing) | Instant, with feedback | 2–3 second delay with no loading indicator | Finding: needs a spinner |
| 3 | Looked for Undo | Undo appears to reverse a mistaken mark | No Undo appeared | Finding: undo not implemented (T26 gap) |
