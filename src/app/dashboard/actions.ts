"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidBill } from "@/lib/budget";

// These functions run on the SERVER. Each one checks who is logged in, then
// changes the database. Row Level Security makes sure a person can only ever
// change their own rows, even if something went wrong here.

export async function addBill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const due_date = String(formData.get("due_date") ?? "");
  const recurrence = String(formData.get("recurrence") ?? "none");

  // Basic guard: skip if the essentials are missing, not a number, or negative.
  // Validating input server-side (not just in the form) keeps a bad amount from
  // ever reaching the database and throwing off "safe to spend." The rule lives
  // in isValidBill (src/lib/budget.ts) so it has one tested home.
  if (!isValidBill({ name, amount, due_date })) return;

  await supabase.from("bills").insert({
    user_id: user.id,
    name,
    amount,
    due_date,
    recurrence,
  });

  revalidatePath("/dashboard");
}

export async function markBillPaid(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await supabase
    .from("bills")
    .update({ status: "paid" })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function deleteBill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  await supabase.from("bills").delete().eq("id", id).eq("user_id", user.id);

  revalidatePath("/dashboard");
}

export async function editBill(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const due_date = String(formData.get("due_date") ?? "");
  const recurrence = String(formData.get("recurrence") ?? "none");
  if (!id || !isValidBill({ name, amount, due_date })) return;

  await supabase
    .from("bills")
    .update({ name, amount, due_date, recurrence })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
}
