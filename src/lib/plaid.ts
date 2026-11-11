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
  // Resilience: never let a slow or flaky Plaid call hang a server action.
  // Every request times out after 15s, and the SDK retries up to 3 times with
  // exponential backoff + jitter on the errors worth retrying (HTTP 408, 429
  // rate limits, and 5xx), honouring any Retry-After header Plaid sends.
  timeoutInSeconds: 15,
  maxRetries: 3,
});
