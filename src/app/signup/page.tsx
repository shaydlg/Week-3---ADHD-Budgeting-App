"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { createClient } from "@/lib/supabase/client";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      // Email confirmation is off: the user is logged in immediately.
      router.push("/dashboard");
      router.refresh();
    } else {
      // Email confirmation is on: ask them to check their inbox.
      setMessage("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, py: 6 }}
      >
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Create your account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {message && <Alert severity="success">{message}</Alert>}
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
          autoComplete="new-password"
          helperText="At least 6 characters."
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{" "}
          <Link component={NextLink} href="/login">
            Log in
          </Link>
        </Typography>
      </Box>
    </Container>
  );
}
