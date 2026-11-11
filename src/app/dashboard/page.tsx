import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markBillPaid, deleteBill } from "./actions";
import {
  refreshTransactions,
  connectSandboxBank,
  disconnectAllBanks,
} from "./plaid-actions";
import AddBillForm from "./AddBillForm";
import ConnectBankButton from "./ConnectBankButton";
import SignOutButton from "@/components/SignOutButton";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";

type Bill = {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  recurrence: string;
  status: string;
};

type Account = {
  id: string;
  bank_name: string;
  account_name: string | null;
  balance: number | null;
  account_subtype: string | null;
};

type Txn = {
  id: string;
  description: string | null;
  amount: number;
  date: string;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // All reads are limited to this user's own rows by Row Level Security.
  const [{ data: accountsData }, { data: txnData }, { data: billsData }] =
    await Promise.all([
      supabase.from("linked_accounts").select("*").order("created_at"),
      supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(15),
      supabase.from("bills").select("*").order("due_date", { ascending: true }),
    ]);

  const accounts = (accountsData ?? []) as Account[];
  const txns = (txnData ?? []) as Txn[];
  const bills = (billsData ?? []) as Bill[];
  const totalSpent = txns.reduce((sum, t) => sum + Number(t.amount), 0);

  // Safe to spend = money in checking/savings minus bills not yet paid.
  const spendable = accounts
    .filter(
      (a) => a.account_subtype === "checking" || a.account_subtype === "savings"
    )
    .reduce((sum, a) => sum + Number(a.balance ?? 0), 0);
  const upcomingBillsTotal = bills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + Number(b.amount), 0);
  const safeToSpend = spendable - upcomingBillsTotal;

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4, py: 6 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Your money
          </Typography>
          <SignOutButton />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: -3 }}>
          Signed in as {user.email}
        </Typography>

        {/* SAFE TO SPEND */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="overline" color="text.secondary">
              Safe to spend
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: safeToSpend >= 0 ? "primary.main" : "warning.main",
              }}
            >
              {money(safeToSpend)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {money(spendable)} in checking and savings, minus{" "}
              {money(upcomingBillsTotal)} in upcoming bills.
            </Typography>
          </CardContent>
        </Card>

        {/* ACCOUNTS */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Accounts
          </Typography>
          {accounts.length === 0 ? (
            <Typography color="text.secondary">
              No bank connected yet. Connect one to track spending automatically.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {accounts.map((a) => (
                <Card key={a.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {a.bank_name}
                        {a.account_name ? ` · ${a.account_name}` : ""}
                      </Typography>
                      <Typography color="text.secondary">
                        {a.balance != null ? money(Number(a.balance)) : "—"}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
          <ConnectBankButton />
          {process.env.PLAID_ENV === "sandbox" && (
            <form action={connectSandboxBank}>
              <Button type="submit" size="small" variant="text">
                Or load a sandbox test bank
              </Button>
            </form>
          )}
          {accounts.length > 0 && (
            <form action={disconnectAllBanks}>
              <Button type="submit" size="small" variant="text" color="error">
                Disconnect all banks
              </Button>
            </form>
          )}
        </Box>

        <Divider />

        {/* SPENDING */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Recent spending
            </Typography>
            <form action={refreshTransactions}>
              <Button type="submit" size="small">
                Refresh
              </Button>
            </form>
          </Stack>
          {txns.length === 0 ? (
            <Typography color="text.secondary">
              No transactions yet. Connect a bank, then press Refresh.
            </Typography>
          ) : (
            <>
              <Typography color="text.secondary">
                {money(totalSpent)} across your {txns.length} most recent
                transactions
              </Typography>
              <Stack spacing={1}>
                {txns.map((t) => (
                  <Stack
                    key={t.id}
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Typography>{t.description ?? "Transaction"}</Typography>
                    <Typography color="text.secondary">
                      {money(Number(t.amount))} · {t.date}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
        </Box>

        <Divider />

        {/* BILLS */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Bills
          </Typography>
          <AddBillForm />
          {bills.length === 0 ? (
            <Typography color="text.secondary">
              No bills yet. Add your first one above.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {bills.map((bill) => (
                <Card key={bill.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>{bill.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {money(Number(bill.amount))} · due {bill.due_date}
                          {bill.recurrence !== "none" ? ` · ${bill.recurrence}` : ""}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Chip
                          label={bill.status}
                          size="small"
                          color={bill.status === "paid" ? "success" : "default"}
                        />
                        {bill.status !== "paid" && (
                          <form action={markBillPaid}>
                            <input type="hidden" name="id" value={bill.id} />
                            <Button type="submit" size="small">
                              Mark paid
                            </Button>
                          </form>
                        )}
                        <form action={deleteBill}>
                          <input type="hidden" name="id" value={bill.id} />
                          <Button type="submit" size="small" color="error">
                            Delete
                          </Button>
                        </form>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Container>
  );
}
