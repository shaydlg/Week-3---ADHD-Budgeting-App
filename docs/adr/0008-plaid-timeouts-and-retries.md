# ADR-0008: Bound every Plaid call with a timeout and retries

## Date and status
November 11, 2026. Accepted.

## Context
All of our Plaid calls run inside server actions (ADR-0006). A third-party call with no time limit is an outage waiting for the other side to be slow: if Plaid hangs, the server action hangs, the user sees a spinner that never resolves, and on Vercel the function eventually hits its own hard timeout with no useful error. We also had no handling for Plaid rate limits (HTTP 429), which can happen when the refresh poll fires several calls in a row.

## Options
- **Do nothing:** rely on Vercel's function timeout as a backstop. Bad: the failure is slow and opaque, and nothing retries a transient blip.
- **Hand-rolled wrapper:** wrap each call in `Promise.race` against a timeout plus a retry loop. Works, but it is code we have to write, test, and keep correct at every call site, and it would duplicate logic the SDK already ships.
- **Configure the SDK (chosen):** the Plaid v51 client accepts `timeoutInSeconds` and `maxRetries`. Its retrier already retries on the right status codes (408, 429, and 5xx), honours the `Retry-After` header, and backs off exponentially with jitter.

## Decision
Set `timeoutInSeconds: 15` and `maxRetries: 3` on the shared `plaidClient` in `src/lib/plaid.ts`. Every Plaid request is now bounded in time and retries transient failures and rate limits automatically, with no per-call-site code.

This is separate from the readiness poll in `refreshTransactions` (ADR-0007): that loop handles a *successful* response that is simply empty because a fresh item's data is not ready yet, whereas these settings handle *transient errors* (timeouts, 429, 5xx). The two cooperate — each retry attempt of the poll is itself a bounded, retrying request.

## Consequences
A slow or flaky Plaid response can no longer hang a server action past ~15s per attempt, and a brief rate limit or server error recovers on its own instead of surfacing to the user. The trade-off is that a genuinely failing call now takes a little longer to give up (up to three backed-off retries) before it throws, which the existing `try/catch` in `syncTransactions` and the action-level error handling already absorb. If we later add a Plaid webhook and move to `/transactions/sync`, these client-level settings still apply unchanged.
