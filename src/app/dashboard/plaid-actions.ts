"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Plaid } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { createClient } from "@/lib/supabase/server";

// Step 1: ask Plaid for a short-lived "link token". The browser needs this to
// open Plaid's secure bank-login window.
export async function createLinkToken(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const res = await plaidClient.link.createToken({
    user: { client_user_id: user.id },
    client_name: "ADHD Budgeting App",
    products: [Plaid.Products.Transactions],
    country_codes: [Plaid.CountryCode.Us],
    language: "en",
  });
  return res.link_token;
}

// Step 2: after the user logs in to their bank, Plaid hands the browser a
// one-time "public token". We trade it for a private access token, save the
// accounts, and pull in the transactions.
export async function connectBank(publicToken: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Trade the public token for a private access token (kept server-side only).
  const exchange = await plaidClient.item.exchangePublicToken({
    public_token: publicToken,
  });
  const accessToken = exchange.access_token;
  const itemId = exchange.item_id;

  // Find the bank's name.
  let institutionName = "Bank";
  const itemRes = await plaidClient.item.get({ access_token: accessToken });
  const institutionId = itemRes.item.institution_id;
  if (institutionId) {
    const inst = await plaidClient.institutions.getById({
      institution_id: institutionId,
      country_codes: [Plaid.CountryCode.Us],
    });
    institutionName = inst.institution.name;
  }

  // Save the connection (this row holds the secret access token).
  const { data: itemRow, error: itemErr } = await supabase
    .from("plaid_items")
    .insert({
      user_id: user.id,
      access_token: accessToken,
      item_id: itemId,
      institution_name: institutionName,
    })
    .select("id")
    .single();
  if (itemErr || !itemRow) return;

  // Save each account, remembering how Plaid's account id maps to our row id.
  const accountsRes = await plaidClient.accounts.get({
    access_token: accessToken,
  });
  const accountIdMap = new Map<string, string>();
  for (const acct of accountsRes.accounts) {
    const { data: acctRow } = await supabase
      .from("linked_accounts")
      .insert({
        user_id: user.id,
        plaid_item_id: itemRow.id,
        plaid_account_id: acct.account_id,
        bank_name: institutionName,
        account_name: acct.name,
        balance: acct.balances.current,
      })
      .select("id")
      .single();
    if (acctRow) accountIdMap.set(acct.account_id, acctRow.id);
  }

  await syncTransactions(accessToken, user.id, accountIdMap);
  revalidatePath("/dashboard");
}

// Sandbox-only shortcut: create a fake bank connection without going through
// Plaid's pop-up. Handy for testing and demos. Only exposed when PLAID_ENV is
// sandbox.
export async function connectSandboxBank() {
  const sandboxRes = await plaidClient.sandbox.createPublicToken({
    institution_id: "ins_109508",
    initial_products: [Plaid.Products.Transactions],
  });
  await connectBank(sandboxRes.public_token);
}

// Re-pull transactions for all of this user's connected banks. A fresh sandbox
// item can take a few seconds to have transactions ready, so we poll.
export async function refreshTransactions() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: items } = await supabase
    .from("plaid_items")
    .select("id, access_token");

  for (const item of items ?? []) {
    const { data: accounts } = await supabase
      .from("linked_accounts")
      .select("id, plaid_account_id")
      .eq("plaid_item_id", item.id);
    const accountIdMap = new Map<string, string>();
    for (const a of accounts ?? []) {
      if (a.plaid_account_id) accountIdMap.set(a.plaid_account_id, a.id);
    }

    for (let attempt = 0; attempt < 6; attempt++) {
      const count = await syncTransactions(
        item.access_token,
        user.id,
        accountIdMap
      );
      if (count > 0) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  revalidatePath("/dashboard");
}

// Shared helper: fetch the last 30 days of transactions with /transactions/get
// and save any we do not already have. Returns how many rows were saved.
async function syncTransactions(
  accessToken: string,
  userId: string,
  accountIdMap: Map<string, string>
): Promise<number> {
  const supabase = await createClient();

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const rows: Record<string, unknown>[] = [];
  try {
    const page = await plaidClient.transactions.get({
      access_token: accessToken,
      start_date: fmt(start),
      end_date: fmt(end),
    });
    for await (const t of page) {
      const localAccountId = accountIdMap.get(t.account_id);
      if (!localAccountId) continue;
      rows.push({
        user_id: userId,
        account_id: localAccountId,
        plaid_transaction_id: t.transaction_id,
        amount: t.amount,
        description: t.name,
        date: t.date,
        is_manual: false,
      });
    }
  } catch {
    // Not ready yet (or a transient error); the caller will retry.
    return 0;
  }

  if (rows.length > 0) {
    await supabase
      .from("transactions")
      .upsert(rows, { onConflict: "user_id,plaid_transaction_id" });
  }
  return rows.length;
}
