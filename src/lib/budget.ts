// Pure budgeting math, kept on its own so it can be unit-tested in isolation.
//
// "Pure" means: these functions only look at the values you pass in and return a
// result. They never touch the database, the network, or the screen. Same input
// in, same answer out, every time. That is exactly what makes them easy to test.
//
// The dashboard page (and anywhere else) imports these instead of doing the math
// inline. The on-screen numbers are unchanged; the math just lives in one place now.

// We only describe the fields each calculation actually needs. Richer objects
// from the database (with ids, names, etc.) still fit, because they have these
// fields too.
export type AccountLike = {
  balance: number | null;
  // Plaid's coarse type ("depository", "credit", "loan", …) and finer subtype
  // ("checking", "savings", "credit card", …). A credit account is never
  // spendable money, no matter its balance (ADR-0010).
  account_type?: string | null;
  account_subtype: string | null;
};

export type BillLike = {
  amount: number;
  status: string;
};

export type TxnLike = {
  amount: number;
};

// Account types whose balance counts as money you could actually spend.
const SPENDABLE_SUBTYPES = ["checking", "savings"];

/** Total of recent transaction amounts. */
export function totalSpent(txns: TxnLike[]): number {
  return txns.reduce((sum, t) => sum + Number(t.amount), 0);
}

/** Money on hand: the combined balance of checking and savings accounts. */
export function spendableBalance(accounts: AccountLike[]): number {
  return (
    accounts
      // ADR-0010: a credit account's balance is debt, never spendable money.
      .filter((a) => a.account_type !== "credit")
      // Of the cash accounts, count only checking and savings (migration 0004).
      .filter((a) => SPENDABLE_SUBTYPES.includes(a.account_subtype ?? ""))
      .reduce((sum, a) => sum + Number(a.balance ?? 0), 0)
  );
}

/** Bills that still need paying (anything not marked "paid"). */
export function upcomingBills<T extends { status: string }>(bills: T[]): T[] {
  return bills.filter((b) => b.status !== "paid");
}

/** Total owed across all still-unpaid bills. */
export function upcomingBillsTotal(bills: BillLike[]): number {
  return upcomingBills(bills).reduce((sum, b) => sum + Number(b.amount), 0);
}

/**
 * The headline number: what's left after setting aside every upcoming bill.
 * spendable balance - total upcoming bills.
 */
export function safeToSpend(accounts: AccountLike[], bills: BillLike[]): number {
  return spendableBalance(accounts) + upcomingBillsTotal(bills);
}

/**
 * Whether a bill the user is adding/editing is valid enough to save.
 * Mirrors the server-side guard: needs a name and a due date, and the amount
 * must be a real number that isn't negative.
 */
export function isValidBill(input: {
  name: string;
  amount: number;
  due_date: string;
}): boolean {
  return (
    Boolean(input.name) &&
    Boolean(input.due_date) &&
    !Number.isNaN(input.amount) &&
    input.amount >= 0
  );
}
