"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { createClient } from "@/lib/supabase/client";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Success: go to the dashboard.
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, py: 6 }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Welcome back
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          New here?{" "}
          <Link component={NextLink} href="/signup">
            Create an account
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
