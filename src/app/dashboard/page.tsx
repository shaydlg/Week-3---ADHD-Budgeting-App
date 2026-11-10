import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { markBillPaid, deleteBill } from "./actions";
import AddBillForm from "./AddBillForm";
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Read this person's bills. Row Level Security limits this to their own rows.
  const { data } = await supabase
    .from("bills")
    .select("*")
    .order("due_date", { ascending: true });
  const bills = (data ?? []) as Bill[];

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 6 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Your bills
          </Typography>
          <SignOutButton />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Signed in as {user.email}
        </Typography>

        <AddBillForm />

        <Divider />

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
                        ${bill.amount.toFixed(2)} · due {bill.due_date}
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
    </Container>
  );
}
