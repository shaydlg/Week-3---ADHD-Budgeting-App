"use client";

import { useState } from "react";
import { addBill } from "./actions";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

// The form that adds a new bill. When submitted, it hands its values to the
// addBill server action. The fields carry `name` attributes so their values
// travel to the server automatically.
export default function AddBillForm() {
  const [recurrence, setRecurrence] = useState("none");

  return (
    <Box component="form" action={addBill} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
      <Button type="submit" variant="contained" size="large">
        Add bill
      </Button>
    </Box>
  );
}
