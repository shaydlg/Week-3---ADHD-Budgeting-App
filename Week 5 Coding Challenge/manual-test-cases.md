# Week 5 — Manual Test Cases (with results)

Two test cases run **by hand on the live app**
(https://week-3-adhd-budgeting-app-nine.vercel.app). Scripts drafted by Claude;
run and observed together with Shay.

---

## Test Case 1 — Adding a bill lowers "Safe to spend"  — ✅ PASS

### Use Case Scenario Being Tested
Bill tracking + safe-to-spend recompute: a user adds an upcoming bill and the
single safe-to-spend number updates to account for it.

### Test Case Scenario Being Tested
An existing, logged-in user adds a new unpaid bill and "Safe to spend" drops by
exactly that amount, with its explanation updated.

### Pre-Conditions
- Logged in, on the dashboard.
- Checking + savings connected (spendable balance = $320.00).
- Baseline: Safe to spend **$297.78**; 1 upcoming bill (Spotify, $22.22).

### Steps to Complete
1. Note the baseline Safe to spend and the "$A … minus $B" line.
2. Bills → Add a bill.
3. Enter `Test Electric`, `$50`, due `2026-12-13`.
4. Submit.

### Expected Results
- `Test Electric` appears in upcoming bills.
- Safe to spend decreases by exactly $50 → $247.78.
- Upcoming-bills total rises to $72.22.

### Actual Results

| Step | What did you do? | What should happen? | What actually happened? | Notes |
| --- | --- | --- | --- | --- |
| 1 | Noted baseline | — | Safe to spend $297.78, upcoming $22.22 | |
| 2–4 | Added Test Electric $50 | Bill saved, safe-to-spend −$50 | Safe to spend → **$247.78**, line → "minus $72.22", bill listed | ✅ exactly as predicted; no duplicate created |

**Result: PASS.** The math is correct.
**Observations (see findings report):** (a) a brief loading flash before the new bill rendered (no spinner); (b) on the *first* attempt in the isolated testing pane the action redirected to login — **not reproducible in Chrome**, so a testing-environment quirk, not an app bug.

---

## Test Case 2 — Marking a bill paid  — 🟡 PARTIAL (removal passed; found a safe-to-spend defect)

### Use Case Scenario Being Tested
Mark a bill paid: a user marks an upcoming bill paid, it leaves the upcoming list,
and safe-to-spend changes accordingly.

### Test Case Scenario Being Tested
An existing, logged-in user marks the `Test Electric` $50 bill paid; it leaves the
upcoming list. (Bonus: an undo option should restore it.)

### Pre-Conditions
- Logged in, on the dashboard (Chrome).
- At least one upcoming bill exists (Test Electric $50).
- Baseline: Safe to spend $247.78; 2 upcoming.

### Steps to Complete
1. Note the baseline.
2. Bills → find Test Electric → Mark paid.
3. Bonus: if an Undo option appears, click it.

### Expected Results
- Test Electric leaves the upcoming list.
- Safe to spend **stays $247.78** — the $50 was spent paying the bill, so it should remain deducted, not restored.
- Bonus: Undo restores the bill.

### Actual Results

| Step | What did you do? | What should happen? | What actually happened? | Notes |
| --- | --- | --- | --- | --- |
| 2 | Marked Test Electric paid | Bill leaves upcoming; safe-to-spend stays $247.78 | Bill left upcoming (correct); safe-to-spend rose to $297.78 (wrong) | Removal ✅; safe-to-spend ❌ defect (finding #5) |
| 2 | (timing) | Instant, with feedback | **2–3 second delay with no loading indicator** | 🟡 finding: needs spinner |
| 3 | Looked for Undo | Undo appears to reverse a mistaken mark | **No Undo appeared** | 🟡 finding: undo not implemented (T26 gap) |

**Result: PARTIAL.** The removal works (the bill leaves "upcoming" ✅), but safe-to-spend **rose to $297.78 when it should have stayed $247.78** — the already-spent money looks restored. ❌ This is a real defect the test surfaced (QA finding #5). The intended behavior and the Plaid balance-lag nuance are in the vision/scope handoff.
