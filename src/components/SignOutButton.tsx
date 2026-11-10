"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@mui/material/Button";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="outlined" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
