"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addBill } from "./actions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

// Shows a "+ Add a bill" button. Clicking it reveals the form; adding a bill
// (or pressing Cancel) tidies the form away again.
export default function AddBillForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [recurrence, setRecurrence] = useState("none");

  async function handleAdd(formData: FormData) {
    await addBill(formData);
    setRecurrence("none");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Add a bill
      </Button>
    );
  }

  return (
    <Box
      component="form"
      action={handleAdd}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField name="name" label="Bill name" required fullWidth />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          name="amount"
          label="Amount"
          type="number"
          required
          fullWidth
          slotProps={{ htmlInput: { step: "0.01", min: "0" } }}
        />
        <TextField
          name="due_date"
          label="Due date"
          type="date"
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
        <Button type="submit" variant="contained" size="large">
          Add bill
        </Button>
        <Button type="button" size="large" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}
