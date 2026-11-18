# ADR-0010: Credit cards as a first-class feature via Plaid Liabilities

## Date and status
November 18, 2026. Accepted. Extends ADR-0004 (Plaid). Source decision: `ADHD-Budgeting-App-Decision-Credit-Cards.md`.

## Context
QA of the safe-to-spend calculation found it ignored credit cards entirely. That is only half right. A card's **balance** is debt and must never count as spendable money, but a card **payment** (what is due this statement cycle) is real money leaving the account soon, exactly like rent or electric. Ignoring the payment overstates safe-to-spend and breaks the product's core promise of one honest number. Paying under the minimum also triggers a late fee plus interest, the penalty-and-shame spiral this app exists to prevent.

The honest figures (statement balance, minimum payment, next due date) are **not** in Plaid's basic account/balance feed. They live in a separate Plaid product, **Liabilities**. Detecting that an account is a credit card is free (Plaid returns the account type with basic data); only those three figures require Liabilities.

## Options
- **Keep cards as a plain manual bill** (ignore Liabilities): no new dependency, but the user must know and type their statement balance and due date, the exact chore we remove everywhere else, and nothing can show a minimum-due guardrail.
- **Card buttons without the real data** (guess, or reuse the current balance): looks helpful but can quietly undercharge a user below the minimum and into a penalty. **Rejected** because it fails the honesty and no-shame promises.
- **Adopt Plaid Liabilities** (chosen): pull each card's real statement balance, minimum payment, and due date so the payment can become a correct, auto-refreshing bill with a real guardrail.

## Decision
Make credit cards a first-class MVP feature, powered by Plaid Liabilities.

- **Store per credit card** (see `database-design.md`): `statement_balance`, `minimum_payment`, `due_date`, `current_balance` (display only), `last_refreshed_at`; refreshed each statement cycle. `is_credit_card` is derived from `linked_accounts.account_type = 'credit'`, not stored.
- **A card payment becomes an ordinary bill**, created by one tap on the card: statement balance (default), minimum, or a custom amount. The bill carries `source_card_id` and a `basis` (`statement` / `minimum` / `custom`).
- **Linked, auto-refreshing bill:** each statement cycle, `statement` and `minimum` bills pull a fresh amount and due date from the card; `custom` keeps its amount and only refreshes the due date.
- **Guardrail:** a custom amount below `minimum_payment` shows a calm warning naming the real minimum ("Minimum due is $35. Paying less may cost you a late fee.").
- **Safe-to-spend** keeps its shape — `safe_to_spend = spendable_balance − sum(upcoming unpaid bills)` — made correct for cards by two rules: `spendable_balance` sums cash (depository) accounts only and **excludes any credit account**; a card payment counts **only** when it exists as a bill, so it flows in through the normal bills sum with no special case. A card balance is never spendable.

## Consequences
- **New MVP dependency: Plaid Liabilities**, billed separately from Transactions/Balance. **Open cost item (status Nov 18, 2026):** Liabilities pricing is not visible in the dashboard while the account is in Sandbox — Plaid shows billing only once Production access is enabled. Resolve before launch by either requesting Production access or asking Plaid sales (see the question drafted in the decision doc). Not a blocker for the Sandbox build (T52–T55); fold the figure into the per-connection cost model when obtained.
- **Data model grows:** a new `card_liabilities` table (one row per credit account) and two new `bills` columns (`source_card_id`, `basis`). The first build step is a SQL migration (`0005_card_liabilities`, ticket T52); it is **not yet applied**, so `database-design.md` lists it under "Planned."
- **A per-cycle refresh job** keeps linked card bills current (ticket T55).
- Safe-to-spend already excludes card balances on the balance side (it sums only depository checking/savings today); the new behavior is counting card-payment bills, which flows in for free once those bills exist.
- **Tickets:** T52 (pull liabilities), T53 (add-to-bills buttons), T54 (minimum guardrail), T55 (auto-refresh); T28 (safe-to-spend) updated with card acceptance criteria.

## Chose a separate table over columns on `linked_accounts`
The liabilities figures live in their own `card_liabilities` table (keyed one-to-one to a credit `linked_accounts` row) rather than as nullable columns on every account, because only credit accounts have this data and it refreshes on its own cadence. This keeps the accounts table clean and gives the figures one home. If a later need argues for columns, that is a small, recordable change.
