import { PlaidClient, PlaidEnvironment } from "plaid";

// The Plaid client talks to Plaid's servers using our secret keys. This file
// only ever runs on the server (the keys have no NEXT_PUBLIC_ prefix).
export const plaidClient = new PlaidClient({
  clientId: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  environment:
    process.env.PLAID_ENV === "production"
      ? PlaidEnvironment.Production
      : PlaidEnvironment.Sandbox,
});
