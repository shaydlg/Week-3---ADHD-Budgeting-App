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
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      // Lowercase + trim so phone auto-capitalisation does not block login.
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Supabase returns a terse "Invalid login credentials"; show a clearer one.
      const friendly = /invalid|credential/i.test(error.message)
        ? "That email or password isn't right. Please check and try again."
        : error.message;
      setError(friendly);
      setLoading(false);
      return;
    }
    // Keep the button in its loading state through the redirect.
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
          slotProps={{
            htmlInput: { autoCapitalize: "none", autoCorrect: "off", spellCheck: false },
          }}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
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
