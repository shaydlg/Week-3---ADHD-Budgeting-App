import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SignOutButton from "@/components/SignOutButton";

// This is a protected page. It runs on the server, checks who is logged in,
// and sends anyone who is not logged in back to the login page.
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3, py: 6 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          You are logged in
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Signed in as {user.email}. This is your private dashboard. Only you can
          see this page, and soon it will show your spending and bills.
        </Typography>
        <Stack direction="row">
          <SignOutButton />
        </Stack>
      </Box>
    </Container>
  );
}
