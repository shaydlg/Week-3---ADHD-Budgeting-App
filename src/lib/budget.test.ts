import { describe, it, expect } from "vitest";
import {
  safeToSpend,
  totalSpent,
  isValidBill,
  spendableBalance,
} from "./budget";

// A test file reads like a checklist of promises the code must keep.
//   describe(...) groups related checks under one heading.
//   it(...)       is one promise, written as a sentence.
//   expect(x).toBe(y)  is the actual check: "x had better equal y".
// If every expect passes, the test is green. If one fails, it goes red and
// tells you exactly which promise broke.

describe("safeToSpend", () => {
  it("subtracts upcoming bills from the spendable balance", () => {
    const accounts = [{ balance: 500, account_subtype: "checking" }];
    const bills = [{ amount: 200, status: "unpaid" }];

    // $500 in checking minus $200 owed = $300 safe to spend.
    expect(safeToSpend(accounts, bills)).toBe(300);
  });

  it("ignores bills that are already paid", () => {
    const accounts = [{ balance: 500, account_subtype: "checking" }];
    const bills = [
      { amount: 200, status: "unpaid" },
      { amount: 150, status: "paid" }, // already paid, so it shouldn't subtract
    ];

    expect(safeToSpend(accounts, bills)).toBe(300);
  });

  it("can go negative when bills are bigger than the balance", () => {
    const accounts = [{ balance: 100, account_subtype: "checking" }];
    const bills = [{ amount: 250, status: "unpaid" }];

    // This is the ADHD-friendly truth: it warns you you're overcommitted.
    expect(safeToSpend(accounts, bills)).toBe(-150);
  });
});

// Credit cards have two different numbers, and safe-to-spend treats them very
// differently (ADR-0010):
//   - the card BALANCE is debt -> never counted as money you can spend.
//   - a card PAYMENT -> only subtracted once you add it as a bill, like rent.
describe("safeToSpend with credit cards (ADR-0010)", () => {
  it("never counts a credit card balance as spendable", () => {
    const accounts = [
      { balance: 500, account_type: "depository", account_subtype: "checking" },
      // A $1,200 card balance is debt, not money. It must be left out.
      { balance: 1200, account_type: "credit", account_subtype: "credit card" },
    ];

    // No bills yet. Safe-to-spend is the $500 cash only, never +$1,200.
    expect(safeToSpend(accounts, [])).toBe(500);
  });

  it("subtracts a card payment only once it exists as a bill", () => {
    const accounts = [
      { balance: 500, account_type: "depository", account_subtype: "checking" },
      { balance: 1200, account_type: "credit", account_subtype: "credit card" },
    ];
    // The user taps the card and adds a $200 payment as a bill. To the math it's
    // just an ordinary unpaid bill -- no special credit-card code needed.
    const billsWithCardPayment = [{ amount: 200, status: "unpaid" }];

    // Cash $500 minus the $200 card-payment bill = $300.
    expect(safeToSpend(accounts, billsWithCardPayment)).toBe(300);
  });
});

// Real Plaid accounts can arrive with a missing balance or subtype, so the math
// must handle nulls safely (a null balance counts as $0; a null subtype can't be
// "checking"/"savings", so it's excluded).
describe("spendableBalance with missing data", () => {
  it("treats a null balance as $0 and ignores an account with no subtype", () => {
    const accounts = [
      { balance: 300, account_type: "depository", account_subtype: "checking" },
      { balance: null, account_type: "depository", account_subtype: "savings" }, // null balance -> $0
      { balance: 100, account_type: "depository", account_subtype: null }, // null subtype -> excluded
    ];

    // Only the $300 checking counts; the null balance adds $0; the no-subtype
    // account is left out.
    expect(spendableBalance(accounts)).toBe(300);
  });
});

// The "recent spending" total on the dashboard.
describe("totalSpent", () => {
  it("adds up every transaction amount", () => {
    const txns = [{ amount: 12.5 }, { amount: 7.25 }, { amount: 30 }];
    expect(totalSpent(txns)).toBe(49.75);
  });

  it("is zero when there are no transactions", () => {
    expect(totalSpent([])).toBe(0);
  });
});

// The server-side guard that decides whether a bill is safe to save. A bad bill
// (no name, no due date, or a negative amount) would quietly throw off
// safe-to-spend, so we stop it before it ever reaches the database.
describe("isValidBill", () => {
  const goodBill = { name: "Electric", amount: 90, due_date: "2026-12-01" };

  it("accepts a complete, sensible bill", () => {
    expect(isValidBill(goodBill)).toBe(true);
  });

  it("accepts a $0 bill (zero is allowed, negative is not)", () => {
    expect(isValidBill({ ...goodBill, amount: 0 })).toBe(true);
  });

  it("rejects a bill with no name", () => {
    expect(isValidBill({ ...goodBill, name: "" })).toBe(false);
  });

  it("rejects a bill with no due date", () => {
    expect(isValidBill({ ...goodBill, due_date: "" })).toBe(false);
  });

  it("rejects a negative amount", () => {
    expect(isValidBill({ ...goodBill, amount: -5 })).toBe(false);
  });

  it("rejects an amount that isn't a real number", () => {
    // Number("abc") is NaN -- this is what a blank or garbled amount field becomes.
    expect(isValidBill({ ...goodBill, amount: NaN })).toBe(false);
  });
});
