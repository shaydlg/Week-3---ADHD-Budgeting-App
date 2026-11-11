import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  refreshTransactions,
  connectSandboxBank,
  disconnectAllBanks,
} from "./plaid-actions";
import AddBillForm from "./AddBillForm";
import BillItem from "./BillItem";
import ConnectBankButton from "./ConnectBankButton";
import SignOutButton from "@/components/SignOutButton";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

type Bill = {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  recurrence: string;
  status: string;
};

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

// Shared look for every collapsible section, so all corners match.
const accordionSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  overflow: "hidden",
  "&:before": { display: "none" },
  "&:first-of-type": { borderRadius: 1 },
  "&:last-of-type": { borderRadius: 1 },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  const spendable = accounts
    .filter(
      (a) => a.account_subtype === "checking" || a.account_subtype === "savings"
    )
    .reduce((sum, a) => sum + Number(a.balance ?? 0), 0);
  const upcomingBills = bills.filter((b) => b.status !== "paid");
  const upcomingBillsTotal = upcomingBills.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );
  const safeToSpend = spendable - upcomingBillsTotal;

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 6 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Your money
          </Typography>
          <SignOutButton />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: -2 }}>
          Signed in as {user.email}
        </Typography>

        {/* SAFE TO SPEND (always visible) */}
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
        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Accounts
            </Typography>
            <Typography color="text.secondary" sx={{ mr: 2 }}>
              {accounts.length > 0 ? `${accounts.length} accounts` : "none connected"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
          </AccordionDetails>
        </Accordion>

        {/* SPENDING */}
        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Recent spending
            </Typography>
            <Typography color="text.secondary" sx={{ mr: 2 }}>
              {txns.length > 0 ? money(totalSpent) : "none yet"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <form action={refreshTransactions}>
                <Button type="submit" size="small">
                  Refresh
                </Button>
              </form>
              {txns.length === 0 ? (
                <Typography color="text.secondary">
                  No transactions yet. Connect a bank, then press Refresh.
                </Typography>
              ) : (
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
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* BILLS */}
        <Accordion defaultExpanded={false} disableGutters elevation={0} sx={accordionSx}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Bills
            </Typography>
            <Typography color="text.secondary" sx={{ mr: 2 }}>
              {upcomingBills.length > 0
                ? `${upcomingBills.length} upcoming`
                : "none upcoming"}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {bills.length === 0 ? (
                <Typography color="text.secondary">
                  No bills yet. Add one below.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {bills.map((bill) => (
                    <BillItem key={bill.id} bill={bill} />
                  ))}
                </Stack>
              )}
              <AddBillForm />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}
