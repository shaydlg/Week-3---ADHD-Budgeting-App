# ADR-0009: Sign users out after 5 minutes of inactivity

## Date and status
November 14, 2026. Accepted.

## Context
The app shows bank balances and a "safe to spend" figure, so an unattended, still-logged-in session is a real risk: someone could walk up to a left-open phone or laptop and see the user's money. Supabase keeps a session alive and silently refreshes it, so by default a user stays logged in indefinitely, even after closing the app. We had no inactivity timeout and only a manual "Sign out" button.

## What the standards say
- **PCI DSS v4.0.1, Requirement 8.2.8:** if a session is idle for more than **15 minutes**, the user must re-authenticate. This is the compliance ceiling, and it became mandatory after March 31, 2025. Source: https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/what-is-the-purpose-of-pci-dss-requirement-8-2-8-which-requires-users-to-reauthenticate-after-15-minutes-of-idle-time
- **OWASP Session Management Cheat Sheet:** "Common idle timeouts ranges are 2-5 minutes for high-value applications and 15-30 minutes for low risk applications." OWASP also recommends pairing the idle timeout with an **absolute** timeout, and states that timeout "must be enforced server-side." Source: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html

## Decision
Treat this as a high-value application and use a **5-minute idle timeout**, the strict end of the OWASP high-value range and well inside the PCI ceiling.

Implemented client-side in `src/components/IdleTimeout.tsx`, mounted on the dashboard. It listens for user activity, and:
- if the tab stays open but idle for 5 minutes, a timer signs the user out;
- it stamps the last-activity time, so if the app is closed and reopened (or a backgrounded tab is refocused) after 5 minutes, it signs the user out on return. This covers the "I forgot to log out and closed the app" case.
On timeout it calls `supabase.auth.signOut()` and redirects to `/login?timeout=1`, where a friendly notice explains what happened.

## Consequences
A left-open session self-closes quickly, which materially reduces the walk-up risk. Deliberate trade-offs, both flagged as future work:
- **No absolute timeout yet.** OWASP recommends one; the user chose not to cap total session length for now.
- **Client-side enforcement.** OWASP's stricter bar is server-side enforcement. A determined attacker who already has the session tokens is not stopped by a client timer; the robust version shortens the Supabase token lifetime (a Supabase Auth setting) and stops silently refreshing an idle session, so the server itself rejects a stale session. That is the next step if this moves toward real cardholder data.
