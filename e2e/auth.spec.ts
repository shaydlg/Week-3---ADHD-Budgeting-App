import { test, expect } from "@playwright/test";

// Smoke test: the dashboard is locked.
//
// A logged-out visitor must never see the dashboard; they should be sent to the
// login page. This drives a real browser to /dashboard with no account and
// checks it lands on /login. It proves the security gate works end-to-end,
// without needing a real login.
test("a logged-out visitor is redirected from the dashboard to login", async ({
  page,
}) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});
