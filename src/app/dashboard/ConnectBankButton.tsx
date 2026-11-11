"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlaidLink } from "react-plaid-link";
import Button from "@mui/material/Button";
import { createLinkToken, connectBank } from "./plaid-actions";

// The button that opens Plaid's secure bank-login window. We fetch a link token
// from our server, hand it to Plaid Link, and when the user finishes we send
// the resulting public token back to our server to finish connecting.
export default function ConnectBankButton() {
  const router = useRouter();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    createLinkToken()
      .then(setLinkToken)
      .catch(() => setLinkToken(null));
  }, []);

  const onSuccess = useCallback(
    async (publicToken: string | null) => {
      if (!publicToken) return;
      setBusy(true);
      await connectBank(publicToken);
      setBusy(false);
      router.refresh();
    },
    [router]
  );

  const { open, ready } = usePlaidLink({ token: linkToken, onSuccess });

  return (
    <Button
      variant="contained"
      onClick={() => open()}
      disabled={!ready || !linkToken || busy}
    >
      {busy ? "Connecting..." : "Connect a bank"}
    </Button>
  );
}
