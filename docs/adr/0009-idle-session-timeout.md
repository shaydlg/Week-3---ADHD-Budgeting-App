# ADR-0009: Sign users out after 5 minutes of inactivity

## Date and status
November 14, 2026. Accepted.

## Context
The app shows bank balances and a "safe to spend" figure, so an unattended, still-logged-in session is a real risk: someone could walk up to a left-open phone or laptop and see the user's money. Supabase keeps a session alive and silently refreshes it, so by default a user stays logged in indefinitely, even after closing the app. We had no inactivity timeout and only a manual "Sign out" button.

## What the standards say
- **PCI DSS v4.0.1, Requirement 8.2.8:** if a session is idle for more than **15 minutes**, the user must re-authenticate. This is the compliance ceiling, and it became mandatory after March 31, 2025. Source: https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/what-is-the-purpose-of-pci-dss-requirement-8-2-8-which-requires-users-to-reauthenticate-after-15-minutes-of-idle-time
- **OWASP Session Management Cheat Sheet:** "Common idle timeouts ranges are 2-5 minutes for high-value applications and 15-30 minutes for low risk applications." OWASP also recommends pairing the idle timeout with an **absolute** timeout, and states that timeout "must be enforced server-side." Source: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

## Decision
Treat this as a high-value application and use a **5-minute idle timeout**, the strict end of the OWASP high-value range and well inside the PCI ceiling. Enforce it in two layers.

**Client-side** (`src/components/IdleTimeout.tsx`, mounted on the dashboard), for immediate, in-tab behaviour:
- if the tab stays open but idle for 5 minutes, a timer signs the user out;
- it stamps the last-activity time, so if the app is closed and reopened (or a backgrounded tab is refocused) after 5 minutes, it signs the user out on return. This covers the "I forgot to log out and closed the app" case.

**Server-side** (`src/lib/supabase/middleware.ts`, i.e. `proxy.ts`), so the limit cannot be bypassed by disabling JavaScript: every request records the activity time in an **http-only** cookie the browser cannot forge. When a request arrives more than 5 minutes after the last one, the proxy signs the session out (`signOut({ scope: "local" })`) and redirects to `/login?timeout=1` before the page renders.

Both paths land on `/login?timeout=1`, where a friendly notice explains what happened. "Activity," server-side, means any request that reaches the proxy (a navigation or a server action); mouse movement alone does not reach the server, which is the correct definition of idle for this control.

## Consequences
A left-open session self-closes quickly from the client, and a session that has gone quiet is refused by the server on its next request even with scripting turned off. This satisfies OWASP's "enforce server-side" point for the ordinary threat model. Two deliberate limits remain, both flagged as future work:
- **No absolute timeout yet.** OWASP recommends one; the user chose not to cap total session length for now.
- **Stolen-token lifetime.** The proxy's activity cookie is per-browser, so it does not by itself shorten how long a *copied* token works from another machine. Fully closing that gap also needs a Supabase Auth setting: shorten the access-token (JWT) lifetime and/or enable Supabase's server-side session inactivity timeout, which refuses to refresh an idle session. That is a dashboard change (and may require a paid plan), so it is left to the operator.
