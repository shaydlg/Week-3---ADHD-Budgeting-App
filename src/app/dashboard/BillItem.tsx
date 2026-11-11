"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { editBill, markBillPaid, deleteBill } from "./actions";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

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

export default function BillItem({ bill }: { bill: Bill }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [recurrence, setRecurrence] = useState(bill.recurrence);

  async function handleSave(formData: FormData) {
    await editBill(formData);
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Box
            component="form"
            action={handleSave}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <input type="hidden" name="id" value={bill.id} />
            <TextField name="name" label="Bill name" defaultValue={bill.name} required fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                name="amount"
                label="Amount"
                type="number"
                defaultValue={bill.amount}
                required
                fullWidth
                slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
              />
              <TextField
                name="due_date"
                label="Due date"
                type="date"
                defaultValue={bill.due_date}
                required
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
            <TextField
              name="recurrence"
              label="Repeats"
              select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
              fullWidth
            >
              <MenuItem value="none">One time</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <Stack direction="row" spacing={1}>
              <Button type="submit" variant="contained" size="small">
                Save
              </Button>
              <Button type="button" size="small" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
          }}
        >
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
            <Button size="small" onClick={() => setEditing(true)}>
              Edit
            </Button>
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
  );
}
